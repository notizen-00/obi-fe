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
		client: {start:"_app/immutable/entry/start.BUhM2UYS.js",app:"_app/immutable/entry/app.Ctb1DBdC.js",imports:["_app/immutable/entry/start.BUhM2UYS.js","_app/immutable/chunks/CfFpVhSr.js","_app/immutable/chunks/Bii5zc9V.js","_app/immutable/chunks/cqn5JsKC.js","_app/immutable/entry/app.Ctb1DBdC.js","_app/immutable/chunks/Bii5zc9V.js","_app/immutable/chunks/HxRlU8Af.js","_app/immutable/chunks/DvAM1aGF.js","_app/immutable/chunks/efsII127.js","_app/immutable/chunks/BJHbQZ_Z.js","_app/immutable/chunks/J6VwwB2d.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:true},
		nodes: [
			__memo(() => import('./0-mE8ahyad.js')),
			__memo(() => import('./1-DU6t0V0D.js')),
			__memo(() => import('./2-BUJPEKjH.js')),
			__memo(() => import('./3-e0cEN4LD.js')),
			__memo(() => import('./4-C5tu0lih.js')),
			__memo(() => import('./5-FMFNQE3V.js')),
			__memo(() => import('./6-CTLe019u.js')),
			__memo(() => import('./7-DI9o-ADw.js')),
			__memo(() => import('./8-t1OAPORP.js'))
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
//# sourceMappingURL=manifest.js-S7ADLjdC.js.map
