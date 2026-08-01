# OBI CBT

Frontend Computer Based Test responsif berbasis SvelteKit dan TypeScript.

## Menjalankan proyek

```bash
npm install
copy .env.example .env
npm run dev
```

Konfigurasikan endpoint API:

```env
PUBLIC_CBT_API_BASE_URL=http://obi-archive.test/_/api.php
PUBLIC_CBT_SERVER_TIMEZONE=Asia/Jakarta

```

## Verifikasi

```bash
npm run check
npm test
npm run build
```

Token hanya disimpan di `sessionStorage`. Soal dirender sebagai teks biasa, timer dikoreksi terhadap waktu server, dan autosave selalu mengirim snapshot jawaban lengkap.
