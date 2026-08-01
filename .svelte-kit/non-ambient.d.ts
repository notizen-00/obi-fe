
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/exams" | "/exam" | "/exam/[id]" | "/exam/[id]/completed" | "/exam/[id]/lobby" | "/forgot-password" | "/login";
		RouteParams(): {
			"/exam/[id]": { id: string };
			"/exam/[id]/completed": { id: string };
			"/exam/[id]/lobby": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string | undefined };
			"/exams": Record<string, never>;
			"/exam": { id?: string | undefined };
			"/exam/[id]": { id: string };
			"/exam/[id]/completed": { id: string };
			"/exam/[id]/lobby": { id: string };
			"/forgot-password": Record<string, never>;
			"/login": Record<string, never>
		};
		Pathname(): "/" | "/exams" | `/exam/${string}` & {} | `/exam/${string}/completed` & {} | `/exam/${string}/lobby` & {} | "/forgot-password" | "/login";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | string & {};
	}
}