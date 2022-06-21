import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';
console.log('dev', dev)

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		  }),

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		},
		trailingSlash: 'always',
		paths: {
			base: dev ? '': '/polkukartta/build'
		},
		//appDir: 'internal',
	}
};

export default config;
