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
		client: {start:"_app/immutable/entry/start.ELT90v-R.js",app:"_app/immutable/entry/app.oMwG_PPH.js",imports:["_app/immutable/entry/start.ELT90v-R.js","_app/immutable/chunks/B7P_DBcB.js","_app/immutable/chunks/Bii5zc9V.js","_app/immutable/chunks/cqn5JsKC.js","_app/immutable/entry/app.oMwG_PPH.js","_app/immutable/chunks/Bii5zc9V.js","_app/immutable/chunks/HxRlU8Af.js","_app/immutable/chunks/DvAM1aGF.js","_app/immutable/chunks/efsII127.js","_app/immutable/chunks/BJHbQZ_Z.js","_app/immutable/chunks/J6VwwB2d.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:true},
		nodes: [
			__memo(() => import('./0-mE8ahyad.js')),
			__memo(() => import('./1-DzR7CHz6.js')),
			__memo(() => import('./2-B1fp5zFU.js')),
			__memo(() => import('./3-CqkyZ3Pl.js')),
			__memo(() => import('./4-Cv2Giwl3.js')),
			__memo(() => import('./5-C4foHulO.js')),
			__memo(() => import('./6-Del8kTF_.js')),
			__memo(() => import('./7-0SUBBYrz.js')),
			__memo(() => import('./8-CIu54CQ2.js'))
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
//# sourceMappingURL=manifest.js-Bq4aLvjj.js.map
