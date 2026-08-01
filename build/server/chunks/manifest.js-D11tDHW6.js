const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.BFIHzR5T.js",app:"_app/immutable/entry/app.CXNdHRCs.js",imports:["_app/immutable/entry/start.BFIHzR5T.js","_app/immutable/chunks/CVGGNhoZ.js","_app/immutable/chunks/Bii5zc9V.js","_app/immutable/chunks/cqn5JsKC.js","_app/immutable/entry/app.CXNdHRCs.js","_app/immutable/chunks/Bii5zc9V.js","_app/immutable/chunks/HxRlU8Af.js","_app/immutable/chunks/DvAM1aGF.js","_app/immutable/chunks/efsII127.js","_app/immutable/chunks/BJHbQZ_Z.js","_app/immutable/chunks/J6VwwB2d.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:true},
		nodes: [
			__memo(() => import('./0-mE8ahyad.js')),
			__memo(() => import('./1-CcHzFkjM.js')),
			__memo(() => import('./2-BrreFDhL.js')),
			__memo(() => import('./3-rvv_t6C9.js')),
			__memo(() => import('./4-DiGou4NM.js')),
			__memo(() => import('./5-CuEyeYYg.js')),
			__memo(() => import('./6-DksF17v5.js')),
			__memo(() => import('./7-BkVDNA7K.js')),
			__memo(() => import('./8-BFPWPkJP.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/exams",
				pattern: /^\/exams\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/exam/[id]",
				pattern: /^\/exam\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/exam/[id]/completed",
				pattern: /^\/exam\/([^/]+?)\/completed\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/exam/[id]/lobby",
				pattern: /^\/exam\/([^/]+?)\/lobby\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/forgot-password",
				pattern: /^\/forgot-password\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export { manifest as m };
//# sourceMappingURL=manifest.js-D11tDHW6.js.map
