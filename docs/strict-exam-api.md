# Strict Exam Security API

Dokumen ini mendefinisikan kontrak backend untuk pencatatan aktivitas keluar dari ruang ujian dan permintaan alasan setelah kejadian ketiga.

## Konvensi umum

- Base URL mengikuti `PUBLIC_CBT_API_BASE_URL`.
- Routing mengikuti API saat ini melalui query `?action=...`.
- Semua endpoint wajib menerima `Authorization: Bearer <access_token>`.
- Semua request dan response menggunakan `Content-Type: application/json`.
- Format sukses:

```json
{
  "success": true,
  "data": {}
}
```

- Format gagal:

```json
{
  "success": false,
  "error": "Pesan kesalahan yang aman ditampilkan ke peserta."
}
```

Backend harus mengambil identitas peserta dari access token. Jangan menerima `user_id` dari client.

## Model status

Semua endpoint pada dokumen ini mengembalikan bentuk status berikut di dalam `data`:

```json
{
  "violation_count": 3,
  "requires_reason": true,
  "warning": "Aktivitas keluar telah tercatat 3 kali. Jelaskan alasan sebelum melanjutkan.",
  "last_event_at": "2026-08-02T09:15:30Z",
  "reason_submitted_at": null
}
```

Field:

| Field | Tipe | Keterangan |
|---|---|---|
| `violation_count` | integer | Jumlah insiden unik untuk peserta dan attempt aktif. |
| `requires_reason` | boolean | `true` setelah insiden ke-3 sampai alasan berhasil disimpan. |
| `warning` | string opsional | Pesan aman untuk ditampilkan ke peserta. |
| `last_event_at` | ISO-8601/null | Waktu event terakhir berdasarkan jam server. |
| `reason_submitted_at` | ISO-8601/null | Waktu alasan insiden ketiga diterima. |

## 1. Ambil status pengawasan

```http
GET ?action=security_status&exam_type_id=12
Authorization: Bearer <token>
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "violation_count": 3,
    "requires_reason": true,
    "warning": "Aktivitas keluar telah tercatat 3 kali. Jelaskan alasan sebelum melanjutkan.",
    "last_event_at": "2026-08-02T09:15:30Z",
    "reason_submitted_at": null
  }
}
```

Endpoint ini dipanggil setiap kali ruang ujian dibuka, termasuk setelah peserta menutup tab, login ulang, lalu masuk kembali ke attempt yang masih aktif.

## 2. Catat event keamanan

```http
POST ?action=security_event
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "exam_type_id": 12,
  "event_id": "0198a2b8-39cc-7d64-a32a-8be85b1a2c60",
  "event_type": "page_exit",
  "occurred_at": "2026-08-02T09:15:29.412Z"
}
```

`event_type` yang valid:

| Nilai | Arti |
|---|---|
| `tab_hidden` | Tab disembunyikan atau peserta berpindah tab/aplikasi. |
| `fullscreen_exit` | Peserta keluar dari fullscreen. |
| `page_exit` | Refresh, navigasi keluar, atau penutupan halaman terdeteksi. |

Response `200` mengembalikan model status terbaru.

### Aturan idempotency wajib

- Buat unique constraint untuk `(attempt_id, event_id)`.
- Increment `violation_count` hanya ketika `event_id` baru berhasil disisipkan.
- Pengiriman ulang `event_id` yang sama harus mengembalikan status `200` tanpa increment kedua.
- Browser dapat mengirim `tab_hidden`, lalu `page_exit` dengan `event_id` sama dalam rentang singkat. Backend boleh memperbarui tipe event menjadi `page_exit`, tetapi hitungan tetap bertambah satu kali.
- Increment dan evaluasi `requires_reason` harus dilakukan dalam satu transaksi database.
- Gunakan waktu server sebagai `created_at`; `occurred_at` hanya metadata dan tidak boleh dipercaya untuk urutan/hukuman.

Saat insert event unik membuat hitungan menjadi tepat `3`, set `requires_reason = true`. Status ini tetap `true` saat logout/login ulang sampai endpoint alasan berhasil dipanggil. Tidak ada banned dan tidak ada submit ujian otomatis.

Request dikirim memakai Fetch `keepalive`, jadi response mungkin tidak sempat dibaca ketika tab benar-benar ditutup. Backend tetap harus memproses request yang sudah diterima.

## 3. Kirim alasan

```http
POST ?action=security_reason
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "exam_type_id": 12,
  "reason": "Koneksi terputus dan browser tertutup otomatis."
}
```

Validasi:

- Attempt harus milik peserta dari token dan masih `in_progress`.
- `requires_reason` harus sedang `true`.
- Alasan setelah trim: minimal 10 dan maksimal 500 karakter.
- Simpan teks mentah sebagai data, bukan HTML; escape saat ditampilkan di panel admin.
- Simpan `reason_submitted_at` berdasarkan waktu server.
- Setelah berhasil, set `requires_reason = false` tanpa mengubah `violation_count`.

Response `200`:

```json
{
  "success": true,
  "data": {
    "violation_count": 3,
    "requires_reason": false,
    "warning": "Alasan telah diterima.",
    "last_event_at": "2026-08-02T09:15:30Z",
    "reason_submitted_at": "2026-08-02T09:18:04Z"
  }
}
```

## Error yang disarankan

| HTTP | Kondisi |
|---|---|
| `400` | JSON atau parameter tidak valid. |
| `401` | Token tidak ada/kedaluwarsa. |
| `403` | Attempt bukan milik peserta. |
| `404` | Ujian atau attempt tidak ditemukan. |
| `409` | Attempt sudah selesai atau alasan tidak sedang diwajibkan. |
| `422` | `event_type`, `event_id`, atau panjang alasan tidak valid. |
| `429` | Rate limit; jangan menghitung request yang ditolak. |

## Skema data minimum

Contoh relasional:

```sql
exam_security_events (
  id bigint primary key,
  attempt_id bigint not null,
  event_id varchar(64) not null,
  event_type varchar(32) not null,
  client_occurred_at timestamp null,
  created_at timestamp not null,
  unique (attempt_id, event_id)
)

exam_security_state (
  attempt_id bigint primary key,
  violation_count integer not null default 0,
  requires_reason boolean not null default false,
  reason text null,
  reason_required_at timestamp null,
  reason_submitted_at timestamp null,
  updated_at timestamp not null
)
```

Simpan status per `attempt_id`, bukan hanya per user atau jenis ujian, agar tryout/ujian berikutnya tidak mewarisi hitungan lama.

## Catatan keterbatasan browser

Browser tidak menjamin event saat aplikasi dipaksa berhenti, perangkat mati, jaringan putus total, atau proses browser dibunuh. Karena itu fitur ini merupakan audit best-effort. Untuk pengawasan absolut dibutuhkan kiosk browser/Safe Exam Browser atau aplikasi native terkelola.
