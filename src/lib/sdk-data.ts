// Every language SDK: what it supports (the SDK requirements matrix), how to get started with it (the
// /languages/<slug>/ pages), and the commands CI runs to prove the snippets those pages show (scripts/snippets.ts).
// Everything on the site that names an SDK reads this file: the homepage, /languages/, /examples/, the roadmap,
// llms.txt, llms-full.txt and the JSON-LD. Adding a language is a new row here plus its snippets/<slug>/ folder.
//
// Facts come from each repository's main branch and README (see SDK_DATA_DATE). Conformance results come from
// each SDK's conformance runner.

/** When the facts below were last checked against the SDK repositories. */
export const SDK_DATA_DATE = '2026-10-07';

/** The GitHub organization every SDK repository lives in. */
export const GITHUB_ORG = 'https://github.com/Docuconf';

/** A file under snippets/<slug>/, shown on the site. `from` and `to` pick the lines between two markers. */
export type Snippet = {
	file: string;
	lang: string;
	/** Shown above the code, usually the file's path in the project. */
	title?: string;
	/** Show from the first line containing this text... */
	from?: string;
	/** ...to the first line after it containing this text (both included). */
	to?: string;
};

/**
 * A command CI runs in a checkout of the SDK's main branch (scripts/snippets.ts). The site shows `show`, or `run`
 * when there is no `show`. With `expect`, the output must match snippets/<slug>/out/<id>.txt, which the site shows.
 */
export type Check = {
	id: string;
	/** Directory in the SDK checkout to run in, or "@install" for a copy of snippets/<slug>/install. */
	cwd: string;
	run: string;
	show?: string;
	exit?: number;
	expect?: boolean;
	env?: Record<string, string>;
};

/** One section of a Get started page: prose (with `code` and [links](url)), code, and the checks it shows. */
export type Step = { text: string; files?: Snippet[]; check?: string };

export type SdkRow = {
	/** URL segment: /languages/<slug>/. */
	slug: string;
	/** The page title: the language, plus the host library when one language has several SDKs. */
	name: string;
	language: string;
	repo: string;
	package: string;
	host: string;
	/** The host library's name alone, for running text. */
	hostShort: string;
	hostUrl: string;
	runtime: string;
	types: string;
	lists: string;
	durations: string;
	configFormats: string;
	keystore: string;
	watch: string;
	profiles: string;
	export: string;
	/** Result of the shared conformance suite (112 cases), and the capability tags it skips. */
	conformance: string;
	/** The SDK's README, relative to the repository root, when it is not README.md. */
	readme?: string;
	/** The runnable "orders" example app: label and path in the repo. */
	example: { label: string; path: string };
	caveats: string[];
	/** The language's file extension or short name, for the code tabs. */
	shiki: string;
	/** One sentence: what the SDK builds on and adds. */
	summary: string;
	guide: {
		/** Install from git or a path today; `registry` is the command that works after the first release. */
		install: Step & { registry: string };
		declare: Step;
		load: Step;
		/** The command that runs the example, with a valid environment. */
		run: string;
		error: Step;
		test: Step;
		export: Step;
		framework: Step & { name: string };
	};
	/** The container image CI runs this SDK's checks in, and a command that adds anything it lacks. */
	ci: { image: string; setup?: string };
	checks: Check[];
};

export const SDK_ROWS: SdkRow[] = [
	{
		slug: 'go',
		name: 'Go',
		language: 'Go',
		repo: 'docuconf-go',
		package: 'github.com/docuconf/docuconf-go',
		host: 'caarlos0/env v11',
		hostShort: 'caarlos0/env',
		hostUrl: 'https://github.com/caarlos0/env',
		runtime: 'Go 1.24',
		types: 'all 9',
		lists: 'csv',
		durations: 'go',
		configFormats: 'json, yaml',
		keystore: 'PKCS#12',
		watch: 'all file types',
		profiles: '—',
		export: 'docuconf export -pkg -type',
		conformance: '112 of 112',
		example: { label: 'net/http', path: 'examples/orders' },
		caveats: ['caarlos0/env parses int as 32-bit, so that range is exported.', 'No TOML config files, no JKS keystores.'],
		shiki: 'go',
		summary:
			'Your config struct stays a caarlos0/env struct. docuconf adds struct tags for secrets and constraints, takes descriptions from doc comments, and ships the `docuconf` CLI that exports and vets contracts.',
		guide: {
			install: {
				text: 'Add the module and install the CLI. Until the first release, both come from the `main` branch.',
				check: 'install',
				registry: 'go get github.com/docuconf/docuconf-go@latest',
			},
			declare: {
				text: 'Keep the struct you would write for caarlos0/env. The `env` and `envDefault` tags are caarlos0\'s own; docuconf adds `secret`, `min`, `max`, `values`, `schemes` and `minItems`, and each doc comment becomes the description. The struct lives in its own package because the exporter imports it.',
				files: [{ file: 'sdk/examples/orders/config/config.go', lang: 'go', title: 'config/config.go' }],
			},
			load: {
				text: '`docuconf.Parse` is caarlos0\'s `env.ParseAs` plus every docuconf check, run once at startup.',
				files: [{ file: 'sdk/examples/orders/main.go', lang: 'go', title: 'main.go', from: 'cfg, err := docuconf.Parse', to: '\t}' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders go run .',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the service refuses to start. It lists every problem with its error code, exits 1, and writes the same lines to `/dev/termination-log` so `kubectl describe pod` shows them.',
				check: 'boot-error',
			},
			test: {
				text: '`ParseWithOptions` takes an explicit environment, so a test never reads or changes the process environment.',
				files: [{ file: 'overlay/examples/orders/config/config_test.go', lang: 'go', title: 'config/config_test.go' }],
				check: 'test',
			},
			export: {
				text: 'The CLI reads the struct by static analysis, so export needs no running program and no environment. Commit `contract.cue`, or publish it with the image; then the platform checks its values against it with `docuconf vet`.',
				files: [{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'net/http, and any framework',
				text: 'Go has no framework config layer to plug into: `Parse` returns a typed struct, and you pass it to whatever you start, whether `net/http`, chi, Echo or gin. The CLI also validates values before deploy: `docuconf vet` checks a values file against the contract, as the hero on the [homepage](/) shows, and `docuconf render` turns valid values into the pod\'s env.',
				check: 'vet',
			},
		},
		ci: { image: 'golang:1.25' },
		checks: [
			{
				id: 'install',
				cwd: '@install',
				run: 'go mod init example.com/app && go get github.com/docuconf/docuconf-go@main && go install github.com/docuconf/docuconf-go/cmd/docuconf@main && go build ./...',
				show: 'go get github.com/docuconf/docuconf-go@main\ngo install github.com/docuconf/docuconf-go/cmd/docuconf@main',
			},
			// The CLI from this checkout, on PATH for the checks below.
			{ id: 'cli', cwd: 'cmd/docuconf', run: 'GOBIN="$(cd ../.. && pwd)/.bin" go install .' },
			{ id: 'test', cwd: 'examples/orders', run: 'go test ./config/' },
			{ id: 'boot-error', cwd: 'examples/orders', run: 'PORT=0 go run .', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders', run: 'docuconf export -pkg ./config -type Config -name orders-api -package orders -o contract.cue' },
			{ id: 'vet', cwd: 'examples/orders', run: 'docuconf vet -contract contract.cue -values values.yaml', exit: 1, expect: true },
		],
	},
	{
		slug: 'typescript',
		name: 'TypeScript (T3 Env)',
		language: 'TypeScript',
		repo: 'docuconf-js',
		package: '@docuconf/t3 (npm)',
		host: 'T3 Env + Zod 4',
		hostShort: 'T3 Env',
		hostUrl: 'https://env.t3.gg',
		runtime: 'Node 22.12',
		types: 'all 9',
		lists: 'csv',
		durations: 'go',
		configFormats: 'json, yaml',
		keystore: 'PKCS#12 (JKS: format check)',
		watch: 'all file types',
		profiles: '—',
		export: 'npx docuconf export src/env.ts',
		conformance: '109 of 112 (skips int64, json-schema)',
		readme: 'packages/t3/README.md',
		example: { label: 'T3 Env', path: 'examples/orders-t3' },
		caveats: [
			'ESM (.mjs) and CommonJS both supported.',
			'int is limited to the safe-integer range.',
			'Tested with Zod 4; other Standard Schema validators (Valibot, ArkType) are untested.',
		],
		shiki: 'ts',
		summary:
			'You keep writing `createEnv({ server })` with Zod 4. docuconf re-exports T3\'s `createEnv` and adds helpers for what Zod has no word for: `secret`, `url({ schemes })`, `duration` and `list`.',
		guide: {
			install: {
				text: 'The packages are not on npm yet. Build them from the `main` branch and install the packed tarballs, with T3 Env and Zod 4 (Node 22.12 or later):',
				check: 'install',
				registry: 'npm install @docuconf/t3 @t3-oss/env-core zod',
			},
			declare: {
				text: 'A T3 Env declaration with a `name` for the contract. Use docuconf\'s `url({ schemes })` rather than `z.url({ protocol })`, and `duration({ default })` rather than `.default("30s")`: both are exported to the contract, and Zod\'s own forms are not. Keep `createEnv` in its own module, so exporting it does not start your server.',
				files: [{ file: 'sdk/examples/orders-t3/src/env.ts', lang: 'ts', title: 'src/env.ts' }],
			},
			load: {
				text: 'Importing `env` validates the environment, so do it before anything else starts. `env.PORT` is a `number` and `env.REQUEST_TIMEOUT` is milliseconds.',
				files: [{ file: 'sdk/examples/orders-t3/src/server.ts', lang: 'ts', title: 'src/server.ts', from: 'import { env }', to: 'import { env }' }],
			},
			run: 'npm run build && DATABASE_URL=postgres://orders:pw@localhost:5432/orders node dist/server.js',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the app does not start. T3\'s `onValidationError` hook, in `env.ts` above, prints every problem with its error code and exits 1. Without the hook, `createEnv` throws a `DocuconfValidationError` listing the same problems.',
				check: 'boot-error',
			},
			test: {
				text: '`env.ts` reads `process.env` when it is imported, so the test loads it in a child process with exactly the environment it wants. It uses Node\'s built-in test runner.',
				files: [{ file: 'overlay/examples/orders-t3/src/env.test.ts', lang: 'ts', title: 'src/env.test.ts' }],
				check: 'test',
			},
			export: {
				text: 'Export imports the module in export mode: `createEnv` records the declaration and checks nothing, so no environment is needed.',
				files: [{ file: 'sdk/examples/orders-t3/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'Next.js and NestJS',
				text: 'In Next.js, only `server` variables are runtime configuration: T3\'s `client` section is inlined at build time, so it is validated as T3 does but never exported. For NestJS, use [@docuconf/nestjs](/languages/nestjs/), which plugs into `ConfigModule.forRoot({ validate })` with class-validator; to keep Zod in a Nest app, pass `(config) => createEnv({ name, server, runtimeEnv: config })` as the `validate` function.',
			},
		},
		ci: { image: 'node:22' },
		checks: [
			{
				id: 'install',
				cwd: '@install',
				run: 'git clone https://github.com/Docuconf/docuconf-js ../docuconf-js && (cd ../docuconf-js && npm ci && npm run build && npm pack -w @docuconf/core -w @docuconf/t3) && npm install ../docuconf-js/docuconf-core-0.1.0.tgz ../docuconf-js/docuconf-t3-0.1.0.tgz @t3-oss/env-core zod && node env.ts',
				show: 'git clone https://github.com/Docuconf/docuconf-js ../docuconf-js\n(cd ../docuconf-js && npm ci && npm run build && npm pack -w @docuconf/core -w @docuconf/t3)\nnpm install ../docuconf-js/docuconf-core-0.1.0.tgz ../docuconf-js/docuconf-t3-0.1.0.tgz @t3-oss/env-core zod',
			},
			{ id: 'build', cwd: '.', run: 'npm ci && npm run build && npm rebuild --ignore-scripts' },
			{ id: 'test', cwd: 'examples/orders-t3', run: 'node --test src/env.test.ts' },
			{ id: 'boot-error', cwd: 'examples/orders-t3', run: 'PORT=0 node dist/server.js', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders-t3', run: 'npx docuconf export src/env.ts --out contract.cue' },
		],
	},
	{
		slug: 'nestjs',
		name: 'TypeScript (NestJS)',
		language: 'TypeScript',
		repo: 'docuconf-js',
		package: '@docuconf/nestjs (npm)',
		host: '@nestjs/config + class-validator',
		hostShort: 'NestJS config',
		hostUrl: 'https://docs.nestjs.com/techniques/configuration',
		runtime: 'Node 22.12, NestJS 11 or 12',
		types: 'all 9',
		lists: 'csv',
		durations: 'go',
		configFormats: 'json, yaml',
		keystore: 'PKCS#12 (JKS: format check)',
		watch: 'all file types',
		profiles: '—',
		export: 'npx docuconf-nestjs export src/orders.config.ts',
		conformance: '109 of 112 (skips int64, json-schema)',
		readme: 'packages/nestjs/README.md',
		example: { label: 'NestJS', path: 'examples/orders-nestjs' },
		caveats: ['ESM and CommonJS builds; NestJS 11 (CommonJS) and 12 (ESM).', 'int is limited to the safe-integer range.'],
		shiki: 'ts',
		summary:
			'You keep the class-validator class from the NestJS docs and `ConfigModule.forRoot({ validate })`. docuconf adds decorators for descriptions, secrets, URL schemes, durations and lists, and a `validate` function that checks everything at boot.',
		guide: {
			install: {
				text: 'The packages are not on npm yet. Build them from the `main` branch and install the packed tarballs, with `@nestjs/config` and class-validator (Node 22.12 or later):',
				check: 'install',
				registry: 'npm install @docuconf/nestjs @nestjs/config class-validator class-transformer',
			},
			declare: {
				text: 'The `EnvironmentVariables` class you would write anyway, with docuconf\'s `@Describe`, `@Secret`, `@UrlSchemes`, `@List` and `@Duration`. Property initializers are the defaults the contract records.',
				files: [{ file: 'sdk/examples/orders-nestjs/src/orders.config.ts', lang: 'ts', title: 'src/orders.config.ts' }],
			},
			load: {
				text: 'Pass the `validate` function to `ConfigModule.forRoot`. `ConfigService` then gives typed values: `REQUEST_TIMEOUT` is milliseconds.',
				files: [
					{ file: 'sdk/examples/orders-nestjs/src/app.module.ts', lang: 'ts', title: 'src/app.module.ts', from: '@Module', to: 'export class AppModule' },
					{ file: 'sdk/examples/orders-nestjs/src/main.ts', lang: 'ts', title: 'src/main.ts', from: 'const config', to: 'const port' },
				],
			},
			run: 'npm run build && DATABASE_URL=postgres://orders:pw@localhost:5432/orders node dist/main.js',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, `validate` throws a `DocuconfValidationError` listing every problem with its error code, Nest logs it, and the process exits 1. The same lines go to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: '`validate` is a plain function of the environment object, so a test calls it with its own object and never touches `process.env`. This uses Node\'s test runner; Jest works the same way.',
				files: [{ file: 'overlay/examples/orders-nestjs/src/orders.config.test.ts', lang: 'ts', title: 'src/orders.config.test.ts' }],
				check: 'test',
			},
			export: {
				text: 'Export loads the module without reading the environment. It compiles TypeScript with your own `typescript` package, with decorators on, as `nest build` does.',
				files: [{ file: 'sdk/examples/orders-nestjs/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'NestJS',
				text: 'This SDK is the NestJS integration: `ConfigModule.forRoot({ validate })`, `ConfigService<OrdersConfig, true>` and `{ infer: true }` work as the Nest docs describe. File inputs (TLS key pairs, config files) are decorators too, and a `reload: "watch"` file reloads in place. To declare with Zod instead, see [@docuconf/t3](/languages/typescript/).',
			},
		},
		ci: { image: 'node:22' },
		checks: [
			{
				id: 'install',
				cwd: '@install',
				run: 'git clone https://github.com/Docuconf/docuconf-js ../docuconf-js && (cd ../docuconf-js && npm ci && npm run build && npm pack -w @docuconf/core -w @docuconf/nestjs) && npm install ../docuconf-js/docuconf-core-0.1.0.tgz ../docuconf-js/docuconf-nestjs-0.1.0.tgz @nestjs/config class-validator class-transformer && node check.mjs',
				show: 'git clone https://github.com/Docuconf/docuconf-js ../docuconf-js\n(cd ../docuconf-js && npm ci && npm run build && npm pack -w @docuconf/core -w @docuconf/nestjs)\nnpm install ../docuconf-js/docuconf-core-0.1.0.tgz ../docuconf-js/docuconf-nestjs-0.1.0.tgz @nestjs/config class-validator class-transformer',
			},
			{ id: 'build', cwd: '.', run: 'npm ci && npm run build && npm rebuild --ignore-scripts' },
			{ id: 'test', cwd: 'examples/orders-nestjs', run: 'node --test dist/orders.config.test.js' },
			{ id: 'boot-error', cwd: 'examples/orders-nestjs', run: 'PORT=0 node dist/main.js', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders-nestjs', run: 'npx docuconf-nestjs export src/orders.config.ts --out contract.cue' },
		],
	},
	{
		slug: 'dotnet',
		name: '.NET',
		language: '.NET',
		repo: 'docuconf-dotnet',
		package: 'Docuconf.Options (NuGet)',
		host: 'Options pattern + appsettings',
		hostShort: 'the .NET Options pattern',
		hostUrl: 'https://learn.microsoft.com/dotnet/core/extensions/options',
		runtime: '.NET 8, .NET 10',
		types: 'all 9',
		lists: 'indexed',
		durations: 'timespan',
		configFormats: 'json',
		keystore: 'PKCS#12',
		watch: 'tls, caBundle, keystore, binary',
		profiles: 'appsettings.{Environment}.json',
		export: 'dotnet app.dll docuconf export',
		conformance: '110 of 112 (skips json-schema)',
		example: { label: 'ASP.NET Core', path: 'examples/orders' },
		caveats: [
			'Platform-mounted appsettings overlays load through AddDocuconfOverlays<T>().',
			'Export runs at runtime; a build-time source generator is planned.',
		],
		shiki: 'csharp',
		summary:
			'Your options class, with the DataAnnotations you already use, plus `[Secret]`, `[UrlSchemes]` and `[Description]`. `AddDocuconf<T>()` binds it, loads its files and validates everything on start.',
		guide: {
			install: {
				text: 'The package is not on NuGet yet. Pack it from the `main` branch into a local folder and add it from there:',
				check: 'install',
				registry: 'dotnet add package Docuconf.Options --prerelease',
			},
			declare: {
				text: 'An ordinary options class. `[Range]`, `[AllowedValues]`, `[MinLength]` and `[Required]` become contract constraints; docuconf adds `[ConfigContract]`, `[Secret]` and `[UrlSchemes]`, and every property needs a `[Description]`. The section `Orders` means `Orders:Port` is the environment variable `ORDERS__PORT`.',
				files: [{ file: 'sdk/examples/orders/OrdersOptions.cs', lang: 'csharp', title: 'OrdersOptions.cs' }],
			},
			load: {
				text: '`AddDocuconf<T>()` replaces `AddOptions<T>().BindConfiguration(...).ValidateOnStart()`: it binds the section, loads file inputs and runs every docuconf check. `DocuconfExport.RunIfRequested` turns the app into its own exporter.',
				files: [{ file: 'sdk/examples/orders/Program.cs', lang: 'csharp', title: 'Program.cs', from: 'if (DocuconfExport', to: 'builder.Services.AddDocuconf' }],
			},
			run: 'ORDERS__DATABASEURL=postgres://orders:pw@localhost:5432/orders dotnet run',
			error: {
				text: 'With `ORDERS__PORT=0` and no `ORDERS__DATABASEURL`, the service refuses to start, lists every problem with its error code and exits 1. The same lines go to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: 'Bind from an in-memory configuration instead of the environment, then read `IOptions<T>.Value`: it throws `OptionsValidationException` with one failure per problem. This is an xUnit test project next to the app.',
				files: [{ file: 'overlay/examples/Orders.Tests/OrdersOptionsTests.cs', lang: 'csharp', title: 'Orders.Tests/OrdersOptionsTests.cs' }],
				check: 'test',
			},
			export: {
				text: 'Export runs the built app with `docuconf export`, so it includes the `appsettings*.json` files that ship with it: their values become defaults and per-environment profiles. There is no build-time source generator yet.',
				files: [{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'ASP.NET Core and the generic host',
				text: '`AddDocuconf<T>()` is an `IServiceCollection` extension, so it works in ASP.NET Core, worker services and any generic host. Inject `IOptions<T>`, or `IOptionsMonitor<T>` for values that reload. A platform-mounted `appsettings.Production.json` overlay loads through `builder.Configuration.AddDocuconfOverlays<T>()`; see the [README](https://github.com/Docuconf/docuconf-dotnet#platform-overlays-and-injected-secrets).',
			},
		},
		ci: { image: 'mcr.microsoft.com/dotnet/sdk:10.0' },
		checks: [
			{ id: 'install', cwd: '@install', run: 'git clone https://github.com/Docuconf/docuconf-dotnet ../docuconf-dotnet && dotnet pack ../docuconf-dotnet/src/Docuconf -c Release -o ../docuconf-packages && dotnet add package Docuconf.Options --prerelease --source ../docuconf-packages && dotnet run', show: 'git clone https://github.com/Docuconf/docuconf-dotnet ../docuconf-dotnet\ndotnet pack ../docuconf-dotnet/src/Docuconf -c Release -o ../docuconf-packages\ndotnet add package Docuconf.Options --prerelease --source ../docuconf-packages' },
			{ id: 'test', cwd: 'examples/Orders.Tests', run: 'dotnet test' },
			{ id: 'boot-error', cwd: 'examples/orders', run: 'ORDERS__PORT=0 dotnet run', exit: 1, expect: true },
			{
				id: 'export',
				cwd: 'examples/orders',
				run: 'dotnet build -c Release && dotnet bin/Release/net10.0/Orders.Api.dll docuconf export contract.cue',
				show: 'dotnet build -c Release\ndotnet bin/Release/net10.0/Orders.Api.dll docuconf export contract.cue',
			},
		],
	},
	{
		slug: 'python',
		name: 'Python',
		language: 'Python',
		repo: 'docuconf-python',
		package: 'docuconf-pydantic (PyPI)',
		host: 'pydantic-settings 2',
		hostShort: 'pydantic-settings',
		hostUrl: 'https://github.com/pydantic/pydantic-settings',
		runtime: 'Python 3.10',
		types: 'all 9',
		lists: 'json (csv opt-in)',
		durations: 'iso8601',
		configFormats: 'json, yaml, toml',
		keystore: 'PKCS#12',
		watch: 'all file types',
		profiles: '—',
		export: 'docuconf export mod:Settings',
		conformance: '112 of 112 (json-schema with the jsonschema extra)',
		example: { label: 'http.server', path: 'examples/orders' },
		caveats: ['No JKS keystores.', 'No profiles.'],
		shiki: 'python',
		summary:
			'Your `BaseSettings` class stays as it is: descriptions from `Field(description=...)`, bounds from `ge`/`le`, secrets from `SecretStr`. docuconf adds URL schemes, CSV lists and file inputs, and checks everything at boot.',
		guide: {
			install: {
				text: 'The distribution is not on PyPI yet. Install it from the `main` branch (Python 3.10 or later); the import package is `docuconf`.',
				check: 'install',
				registry: 'pip install docuconf-pydantic',
			},
			declare: {
				text: 'A pydantic-settings class. `Field(description=...)`, `ge`, `le` and `min_length` become the contract; docuconf adds `Url(schemes=...)` and `Csv()`, and `docuconf_service` names the contract.',
				files: [{ file: 'sdk/examples/orders/app.py', lang: 'python', title: 'app.py', from: 'class Settings', to: 'worker_count:' }],
			},
			load: {
				text: '`docuconf.load` instantiates the class as pydantic-settings would, then checks every rule and raises `ConfigValidationError` listing every problem.',
				files: [{ file: 'sdk/examples/orders/app.py', lang: 'python', title: 'app.py', from: 'def main', to: 'sys.exit(1)' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders .venv/bin/python app.py',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the service refuses to start, lists every problem with its error code and exits 1. The same text goes to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: 'A pytest test. `monkeypatch` sets exactly the variables each test needs and restores the environment afterwards; `termination_log=False` keeps tests from writing one.',
				files: [{ file: 'overlay/examples/orders/test_settings.py', lang: 'python', title: 'test_settings.py' }],
				check: 'test',
			},
			export: {
				text: 'Export imports the class and writes the contract without reading the environment. `--check` fails when the committed file is out of date, for CI.',
				files: [{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'FastAPI, Django and Flask',
				text: 'Call `docuconf.load(Settings)` once at startup and share the result: in FastAPI, at module level or in the lifespan, then hand it out with `Depends`; in Django, in `settings.py`, copying the values into Django\'s settings; in Flask, in the app factory, before `app.config.from_mapping`. A failed load raises before the app serves anything.',
			},
		},
		ci: { image: 'python:3.12' },
		checks: [
			{
				id: 'install',
				cwd: '@install',
				run: 'python3 -m venv .venv && . .venv/bin/activate && pip install "docuconf-pydantic @ git+https://github.com/Docuconf/docuconf-python@main" && python check.py',
				show: 'pip install "docuconf-pydantic @ git+https://github.com/Docuconf/docuconf-python@main"',
			},
			{ id: 'venv', cwd: 'examples/orders', run: 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt pytest' },
			{ id: 'test', cwd: 'examples/orders', run: '.venv/bin/pytest -q test_settings.py' },
			{ id: 'boot-error', cwd: 'examples/orders', run: 'PORT=0 .venv/bin/python app.py', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders', run: '.venv/bin/docuconf export app:Settings -o contract.cue' },
		],
	},
	{
		slug: 'ruby',
		name: 'Ruby',
		language: 'Ruby',
		repo: 'docuconf-ruby',
		package: 'docuconf-anyway (RubyGems)',
		host: 'anyway_config 2',
		hostShort: 'anyway_config',
		hostUrl: 'https://github.com/palkan/anyway_config',
		runtime: 'Ruby 3.2',
		types: 'all 9',
		lists: 'csv',
		durations: 'iso8601',
		configFormats: 'json, yaml, toml',
		keystore: 'PKCS#12 (JKS: format check)',
		watch: 'all file types',
		profiles: 'Rails YAML (RAILS_ENV)',
		export: 'rails docuconf:export',
		conformance: '112 of 112',
		example: { label: 'Rack', path: 'examples/orders' },
		caveats: ['Rails credentials must be excluded explicitly.', 'TOML needs the tomlrb gem.'],
		shiki: 'ruby',
		summary:
			'You keep your `Anyway::Config` classes, and anyway_config keeps loading YAML, credentials and the environment. docuconf adds `describe`, `secret` and file inputs, checks everything when the config loads, and exports the contract with a rake task.',
		guide: {
			install: {
				text: 'The gem is not on RubyGems yet. Take it from the `main` branch (Ruby 3.2+, anyway_config 2.6+); in Rails the Railtie loads automatically.',
				files: [{ file: 'install/Gemfile', lang: 'ruby', title: 'Gemfile', from: '# Until', to: 'gem "docuconf-anyway"' }],
				check: 'install',
				registry: 'gem "docuconf-anyway"',
			},
			declare: {
				text: 'An `Anyway::Config` class with `include Docuconf::Anyway`. `attr_config`, `required` and `coerce_types` are anyway_config\'s own; `describe :attr, "description", **constraints` and `secret :attr` are docuconf\'s.',
				files: [{ file: 'sdk/examples/orders/config/orders_config.rb', lang: 'ruby', title: 'config/orders_config.rb' }],
			},
			load: {
				text: 'Instantiating the class loads and validates it. On any problem it raises `Docuconf::Anyway::ValidationError`, a subclass of anyway_config\'s own `ValidationError`, listing every problem.',
				files: [{ file: 'sdk/examples/orders/config.ru', lang: 'ruby', title: 'config.ru', from: 'begin', to: '^end' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders bundle exec ruby server.rb',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the service refuses to start, lists every problem with its error code and exits 1. The secret\'s value, and even its scheme, is left out.',
				check: 'boot-error',
			},
			test: {
				text: 'A Minitest test. anyway_config\'s own `with_env` helper sets variables for one block and restores `ENV` afterwards. RSpec works the same way.',
				files: [{ file: 'overlay/examples/orders-test/test/orders_config_test.rb', lang: 'ruby', title: 'test/orders_config_test.rb' }],
				check: 'test',
			},
			export: {
				text: 'Export loads the class without instantiating it, so it needs no environment. In Rails, `bin/rails docuconf:export OUT=contract.cue` does the same, taking the name from the app.',
				files: [{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'Rails',
				text: 'Put the class in `config/configs/`, as anyway_config suggests. The Railtie adds `bin/rails docuconf:export` and `bin/rails docuconf:check`, and reads `config/<name>.yml` per `RAILS_ENV` into the contract as profiles. Values from Rails credentials are not part of the platform contract: mark them with `exclude :attr`. See the [README](https://github.com/Docuconf/docuconf-ruby#export-the-contract).',
			},
		},
		ci: { image: 'ruby:3.3' },
		checks: [
			{ id: 'install', cwd: '@install', run: 'bundle install && bundle exec ruby check.rb', show: 'bundle install' },
			{ id: 'bundle', cwd: 'examples/orders', run: 'bundle install' },
			{ id: 'test', cwd: 'examples/orders-test', run: 'bundle install && bundle exec ruby test/orders_config_test.rb', show: 'bundle exec ruby test/orders_config_test.rb' },
			{ id: 'boot-error', cwd: 'examples/orders', run: 'PORT=0 bundle exec ruby server.rb', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders', run: 'bundle exec docuconf export --name orders-api --package orders --out contract.cue config/orders_config.rb' },
		],
	},
	{
		slug: 'java',
		name: 'Java (Spring Boot)',
		language: 'Java',
		repo: 'docuconf-java',
		package: 'dev.docuconf:docuconf-spring (Maven)',
		host: 'Spring Boot 3 / 4 @ConfigurationProperties',
		hostShort: 'Spring Boot',
		hostUrl: 'https://docs.spring.io/spring-boot/reference/features/external-config.html',
		runtime: 'Java 17',
		types: 'all 9',
		lists: 'csv',
		durations: 'iso8601',
		configFormats: 'json, yaml, toml',
		keystore: 'PKCS#12, JKS',
		watch: 'all file types',
		profiles: 'application-{profile}.yml',
		export: 'annotation processor at compile time',
		conformance: '112 of 112',
		example: { label: 'Spring Boot', path: 'examples/orders' },
		caveats: ['Several active profiles at once (a,b) are not supported yet.', 'The dev.docuconf Maven namespace is not verified on Maven Central yet.'],
		shiki: 'java',
		summary:
			'Your `@ConfigurationProperties` records, with the Bean Validation annotations you already use, marked `@Docuconf`. An annotation processor writes the contract at compile time, and an auto-configuration checks everything before any bean binds.',
		guide: {
			install: {
				text: 'The artifacts are not on Maven Central yet. Install them from the `main` branch into your local Maven repository (Java 17+), then add the starter and the annotation processor:',
				check: 'install',
				files: [
					{ file: 'install/pom.xml', lang: 'xml', title: 'pom.xml: dependencies', from: 'docuconf: from mvn install', to: '</dependency>' },
					{ file: 'install/pom.xml', lang: 'xml', title: 'pom.xml: maven-compiler-plugin configuration', from: 'docuconf: writes', to: 'end docuconf' },
				],
				registry: 'dev.docuconf:docuconf-spring:0.1.0 and dev.docuconf:docuconf-processor:0.1.0 from Maven Central',
			},
			declare: {
				text: 'An ordinary `@ConfigurationProperties` record with Bean Validation annotations. docuconf adds `@Docuconf`, `@Secret` and `@UrlSchemes`; the Javadoc `@param` lines are the descriptions. Spring binds `orders.port` from `ORDERS_PORT`.',
				files: [{ file: 'sdk/examples/orders/src/main/java/dev/docuconf/examples/orders/OrdersProperties.java', lang: 'java', title: 'OrdersProperties.java' }],
			},
			load: {
				text: 'Nothing to call. The `docuconf-spring` auto-configuration checks the environment against the contract once it is complete and before any bean is created, so no properties bean ever binds a bad value.',
				files: [{ file: 'sdk/examples/orders/src/main/java/dev/docuconf/examples/orders/OrdersApplication.java', lang: 'java', title: 'OrdersApplication.java', from: '@SpringBootApplication', to: 'SpringApplication.run' }],
			},
			run: 'ORDERS_DATABASEURL=postgres://orders:pw@localhost:5432/orders java -jar examples/orders/target/orders.jar',
			error: {
				text: 'With `ORDERS_PORT=0` and no `ORDERS_DATABASEURL`, Spring Boot\'s failure analyzer prints every problem with its error code, and the process exits 1. The same lines go to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: 'Spring Boot\'s `ApplicationContextRunner` starts just the configuration, with properties you pass, so the test needs no environment variables and no web server.',
				files: [{ file: 'overlay/examples/orders-test/src/test/java/dev/docuconf/examples/orders/OrdersPropertiesTest.java', lang: 'java', title: 'OrdersPropertiesTest.java' }],
				check: 'test',
			},
			export: {
				text: 'The annotation processor writes `META-INF/docuconf/contract.cue` on every compile, into `target/classes` and so into the jar. Copy it next to the app and commit it, or publish it with the image.',
				files: [{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'Spring Boot',
				text: 'This SDK is the Spring Boot integration, for Spring Boot 3 and 4. Profiles in `application-{profile}.yml` are exported as contract profiles, and a platform-mounted `application.yml` overlay is supported. `docuconf.enabled=false` skips the check for build-time tasks. See the [README](https://github.com/Docuconf/docuconf-java#readme).',
			},
		},
		ci: { image: 'maven:3.9-eclipse-temurin-17', setup: 'command -v git >/dev/null || (apt-get update -qq && apt-get install -y -qq git >/dev/null)' },
		checks: [
			{
				id: 'install',
				cwd: '@install',
				run: 'git clone https://github.com/Docuconf/docuconf-java ../docuconf-java && mvn -q -f ../docuconf-java install -DskipTests && mvn -q compile && test -f target/classes/META-INF/docuconf/contract.cue',
				show: 'git clone https://github.com/Docuconf/docuconf-java ../docuconf-java\nmvn -f ../docuconf-java install -DskipTests',
			},
			{ id: 'sdk', cwd: '.', run: 'mvn -q install -DskipTests' },
			{ id: 'test', cwd: 'examples/orders-test', run: 'mvn -q test', show: 'mvn test' },
			{
				id: 'boot-error',
				cwd: '.',
				run: 'mvn -q -pl examples/orders -am package -DskipTests && ORDERS_PORT=0 java -jar examples/orders/target/orders.jar',
				show: 'ORDERS_PORT=0 java -jar examples/orders/target/orders.jar',
				exit: 1,
				expect: true,
			},
			{
				id: 'export',
				cwd: '.',
				run: 'mvn -q -pl examples/orders -am compile && cp examples/orders/target/classes/META-INF/docuconf/contract.cue examples/orders/contract.cue',
				show: 'mvn -pl examples/orders -am compile\ncp examples/orders/target/classes/META-INF/docuconf/contract.cue examples/orders/contract.cue',
			},
		],
	},
	{
		slug: 'kotlin',
		name: 'Kotlin',
		language: 'Kotlin',
		repo: 'docuconf-kotlin',
		package: 'dev.docuconf:docuconf-hoplite (Maven)',
		host: 'Hoplite 3',
		hostShort: 'Hoplite',
		hostUrl: 'https://github.com/sksamuel/hoplite',
		runtime: 'JDK 17, Kotlin 2.2',
		types: 'all 9',
		lists: 'csv',
		durations: 'iso8601',
		configFormats: 'json, yaml, toml',
		keystore: 'PKCS#12, JKS',
		watch: 'not offered',
		profiles: '—',
		export: 'Docuconf.exportCue()',
		conformance: '112 of 112',
		example: { label: 'JDK HttpServer', path: 'examples/orders' },
		caveats: ['JVM target only so far; the core module is Kotlin Multiplatform-ready.', 'No reload: watch.'],
		shiki: 'kotlin',
		summary:
			'You keep writing a Hoplite data class. docuconf adds annotations for descriptions, bounds, URL schemes and file inputs, checks every variable and file before Hoplite binds the class, and exports the contract.',
		guide: {
			install: {
				text: 'The artifacts are not on Maven Central yet. Clone the repository next to your project and include it as a Gradle composite build (JDK 17+); Gradle builds it from source:',
				check: 'install',
				files: [
					{ file: 'install/settings.gradle.kts', lang: 'kotlin', title: 'settings.gradle.kts', from: 'Until the first release', to: '^}' },
					{ file: 'install/build.gradle.kts', lang: 'kotlin', title: 'build.gradle.kts', from: 'dependencies {', to: '^}' },
				],
				registry: 'implementation("dev.docuconf:docuconf-hoplite:0.1.0") from Maven Central',
			},
			declare: {
				text: 'A plain Hoplite data class. Hoplite reads `_` in a variable name as nesting, so `LOG_LEVEL` is `log.level`. docuconf adds `@Doc`, `@Min`, `@Max`, `@Items`, `@DurationMin`, `@DurationMax` and `@Schemes`; a Hoplite `Secret` is exported as a secret.',
				files: [{ file: 'sdk/examples/orders/src/main/kotlin/dev/docuconf/examples/orders/OrdersConfig.kt', lang: 'kotlin', title: 'OrdersConfig.kt', from: 'data class OrdersConfig', to: 'val count' }],
			},
			load: {
				text: '`Docuconf.load<T>()` checks every variable and file, then lets Hoplite bind the class. On failure it throws `ConfigViolationException` listing every problem.',
				files: [{ file: 'sdk/examples/orders/src/main/kotlin/dev/docuconf/examples/orders/Main.kt', lang: 'kotlin', title: 'Main.kt', from: 'val config = try', to: '^    }$' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders examples/orders/build/install/orders/bin/orders',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the service refuses to start, lists every problem with its error code and exits 1. The same text goes to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: '`Docuconf.load` takes an `env` map, so a test never reads or changes the process environment. This uses `kotlin.test` on JUnit 5.',
				files: [{ file: 'overlay/examples/orders-test/src/test/kotlin/OrdersConfigTest.kt', lang: 'kotlin', title: 'OrdersConfigTest.kt' }],
				check: 'test',
			},
			export: {
				text: '`Docuconf.exportCue(OrdersConfig::class, service = "orders")` returns the contract. The example wraps the SDK\'s `Export` main class in a Gradle task, so CI can rerun it and fail when the committed file differs.',
				files: [
					{ file: 'sdk/examples/orders/build.gradle.kts', lang: 'kotlin', title: 'build.gradle.kts', from: 'val exportContract', to: '^}' },
					{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' },
				],
				check: 'export',
			},
			framework: {
				name: 'Ktor, http4k and plain JVM services',
				text: 'Call `Docuconf.load<AppConfig>()` in `main` before you start the server, and pass the result to Ktor\'s `embeddedServer` or your http4k app. A `TlsKeyPair` file input gives a `KeyStore` for Ktor\'s `sslConnector`. Spring Boot apps should use the [Java SDK](/languages/java/), which hooks into Spring\'s own binding.',
			},
		},
		ci: { image: 'gradle:8.14-jdk17', setup: 'command -v git >/dev/null || (apt-get update -qq && apt-get install -y -qq git >/dev/null)' },
		checks: [
			{
				id: 'install',
				cwd: '@install',
				run: 'git clone https://github.com/Docuconf/docuconf-kotlin ../docuconf-kotlin && ../docuconf-kotlin/gradlew -q compileKotlin',
				show: 'git clone https://github.com/Docuconf/docuconf-kotlin ../docuconf-kotlin',
			},
			{ id: 'test', cwd: 'examples/orders-test', run: '../../gradlew -q test', show: './gradlew test' },
			{
				id: 'boot-error',
				cwd: '.',
				run: './gradlew -q :orders:installDist && PORT=0 examples/orders/build/install/orders/bin/orders',
				show: 'PORT=0 examples/orders/build/install/orders/bin/orders',
				exit: 1,
				expect: true,
			},
			{ id: 'export', cwd: '.', run: './gradlew -q :orders:exportContract', show: './gradlew :orders:exportContract' },
		],
	},
	{
		slug: 'rust',
		name: 'Rust',
		language: 'Rust',
		repo: 'docuconf-rust',
		package: 'docuconf (crates.io)',
		host: 'figment + serde',
		hostShort: 'figment',
		hostUrl: 'https://docs.rs/figment',
		runtime: 'Rust 1.89',
		types: 'all 9',
		lists: 'json',
		durations: 'go',
		configFormats: 'json, yaml, toml',
		keystore: 'PKCS#12',
		watch: 'rejected at declaration',
		profiles: 'figment profiles',
		export: 'docuconf::export()',
		conformance: '112 of 112',
		example: { label: 'std::net', path: 'examples/orders' },
		caveats: ['No reload: watch.', 'No JKS keystores.'],
		shiki: 'rust',
		summary:
			'Keep your `#[derive(Deserialize)]` config struct and add `#[derive(Docuconf)]`. Doc comments are the descriptions, the Rust type picks the contract type, and figment\'s files and profiles become the contract\'s defaults and profiles.',
		guide: {
			install: {
				text: 'The crate is not on crates.io yet. Add it from the `main` branch (Rust 1.89+), with serde:',
				check: 'install',
				registry: 'cargo add docuconf serde --features serde/derive',
			},
			declare: {
				text: 'A serde struct with `#[derive(Docuconf)]`. `///` comments are the descriptions; `#[docuconf(...)]` sets defaults and constraints; `Secret<T>` marks a secret and keeps it out of `Debug`.',
				files: [{ file: 'sdk/examples/orders/src/main.rs', lang: 'rust', title: 'src/main.rs', from: '/// The service\'s configuration', to: '^}$' }],
			},
			load: {
				text: '`docuconf::load()` reads the environment and every file input and returns the struct, or an error listing every problem.',
				files: [{ file: 'sdk/examples/orders/src/main.rs', lang: 'rust', title: 'src/main.rs', from: 'let config: Config = docuconf::load()', to: 'let config: Config = docuconf::load()' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders cargo run -p orders',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the service refuses to start, lists every problem with its error code and exits 1. The same lines go to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: '`Loader::env` replaces the process environment, so a test passes exactly the variables it wants. Put the tests next to the struct, in a `#[cfg(test)]` module.',
				files: [{ file: 'overlay/examples/orders-test/src/tests.rs', lang: 'rust', title: 'src/tests.rs' }],
				check: 'test',
			},
			export: {
				text: 'The app exports its own contract with `docuconf::export::<Config>(&meta)`, here behind an `export` argument, so CI can rerun it and fail when the committed file differs.',
				files: [
					{ file: 'sdk/examples/orders/src/main.rs', lang: 'rust', title: 'src/main.rs', from: 'if args.first()', to: '^    }$' },
					{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' },
				],
				check: 'export',
			},
			framework: {
				name: 'axum, Rocket and actix-web',
				text: 'Call `docuconf::load()` in `main` before you build the router, and share the struct as axum state or an actix `Data`. Rocket already uses figment: give docuconf\'s `Loader` your figment with `.figment(...)` and `.profiles(...)`, so the contract carries the same files and profiles. Do not add figment\'s own `Env` provider alongside it: it trims values and guesses types. See the [README](https://github.com/Docuconf/docuconf-rust#config-files-and-profiles).',
			},
		},
		ci: { image: 'rust:1.89' },
		checks: [
			{
				id: 'install',
				cwd: '@install',
				run: 'cargo add docuconf --git https://github.com/Docuconf/docuconf-rust && cargo add serde --features derive && cargo build -q',
				show: 'cargo add docuconf --git https://github.com/Docuconf/docuconf-rust\ncargo add serde --features derive',
			},
			{ id: 'test', cwd: 'examples/orders-test', run: 'cargo test -q' },
			{ id: 'boot-error', cwd: 'examples/orders', run: 'PORT=0 cargo run -q -p orders', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders', run: 'cargo run -q -p orders -- export contract.cue' },
		],
	},
	{
		slug: 'swift',
		name: 'Swift',
		language: 'Swift',
		repo: 'docuconf-swift',
		package: 'Docuconf (SwiftPM)',
		host: 'swift-configuration',
		hostShort: 'swift-configuration',
		hostUrl: 'https://github.com/apple/swift-configuration',
		runtime: 'Swift 6.2',
		types: 'all 9',
		lists: 'csv',
		durations: 'seconds',
		configFormats: 'json, yaml',
		keystore: 'PKCS#12, JKS (integrity check)',
		watch: 'when the app consumes changes',
		profiles: '—',
		export: 'app docuconf-export',
		conformance: '110 of 112 (skips json-schema)',
		example: { label: 'POSIX sockets', path: 'Examples/Orders' },
		caveats: ['Built and tested on Linux; macOS and iOS builds are untested.', 'No TOML, no profiles.'],
		shiki: 'swift',
		summary:
			'Values are read through Apple\'s swift-configuration, with its key names and parsing. docuconf adds the declaration it lacks: `@Env` and `@FileInput` property wrappers with descriptions, secrets and constraints.',
		guide: {
			install: {
				text: 'There is no tagged release yet, so depend on the `main` branch (Swift 6.2+, Linux or macOS 15+):',
				files: [{ file: 'install/Package.swift', lang: 'swift', title: 'Package.swift', from: 'dependencies: [', to: '^    ]' }],
				check: 'install',
				registry: '.package(url: "https://github.com/Docuconf/docuconf-swift", from: "0.1.0")',
			},
			declare: {
				text: 'A struct conforming to `DocuconfConfig`, with one `@Env` per variable: the swift-configuration key, a description and the rules. The environment variable is the key in upper case (`log.level` is `LOG_LEVEL`). A property with no initial value is required.',
				files: [{ file: 'sdk/Examples/Orders/Sources/Orders/main.swift', lang: 'swift', title: 'Sources/Orders/main.swift', from: 'enum LogLevel', to: '^}$' }],
			},
			load: {
				text: '`Docuconf.load` reads every variable through swift-configuration and checks every file, then returns the struct or throws `ConfigurationError` listing every problem. `exportIfRequested` turns the executable into its own exporter.',
				files: [{ file: 'sdk/Examples/Orders/Sources/Orders/main.swift', lang: 'swift', title: 'Sources/Orders/main.swift', from: 'Docuconf.exportIfRequested', to: '^}$' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders swift run Orders',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the service does not start: it lists every problem with its error code and exits 1. The same text goes to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: '`LoadOptions(environment:)` replaces the process environment, so a test passes exactly the variables it wants. This uses Swift Testing, in a test target that depends on the executable.',
				files: [{ file: 'overlay/Examples/Orders/Tests/OrdersTests/OrdersConfigTests.swift', lang: 'swift', title: 'Tests/OrdersTests/OrdersConfigTests.swift' }],
				check: 'test',
			},
			export: {
				text: 'In export mode the executable reads no environment and checks no files, so it runs in CI without production values.',
				files: [{ file: 'sdk/Examples/Orders/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'Vapor and Hummingbird',
				text: 'Load the config in your entry point before you build the `Application`, then pass it to your routes. The keys are swift-configuration keys, so `reader.int(forKey: "port")` elsewhere reads the same value, and a `TLSKeyPair` file input gives PEM ready for swift-nio-ssl. To add config files, pass providers as `Docuconf.load(_:files:)`; see the [README](https://github.com/Docuconf/docuconf-swift#readme).',
			},
		},
		ci: { image: 'swift:6.2' },
		checks: [
			{ id: 'install', cwd: '@install', run: 'swift build', show: 'swift build' },
			// The example has no test target; add one for the site's test.
			{ id: 'test-target', cwd: 'Examples/Orders', run: 'printf \'\\npackage.targets.append(.testTarget(name: "OrdersTests", dependencies: ["Orders"]))\\n\' >> Package.swift' },
			{ id: 'test', cwd: 'Examples/Orders', run: 'swift test' },
			{ id: 'boot-error', cwd: 'Examples/Orders', run: 'swift build && PORT=0 swift run Orders', show: 'PORT=0 swift run Orders', exit: 1, expect: true },
			{ id: 'export', cwd: 'Examples/Orders', run: 'swift run Orders docuconf-export --out contract.cue' },
		],
	},
	{
		slug: 'elixir',
		name: 'Elixir',
		language: 'Elixir',
		repo: 'docuconf-elixir',
		package: 'docuconf (Hex)',
		host: 'config/runtime.exs',
		hostShort: 'runtime.exs',
		hostUrl: 'https://hexdocs.pm/elixir/config-and-releases.html',
		runtime: 'Elixir 1.18, OTP 25',
		types: 'all 9',
		lists: 'csv',
		durations: 'go',
		configFormats: 'json (yaml, toml via a decoder)',
		keystore: 'PKCS#12, JKS (integrity check)',
		watch: 'with Docuconf.Watcher',
		profiles: '—',
		export: 'mix docuconf.export',
		conformance: '112 of 112',
		example: { label: ':httpd', path: 'examples/orders' },
		caveats: ['Watched files reload only while the app supervises Docuconf.Watcher.'],
		shiki: 'elixir',
		summary:
			'You keep `config/runtime.exs`. docuconf gives it one declaration, in the NimbleOptions style, of every variable and file the app reads, checks them all at boot, and exports the contract with `mix docuconf.export`.',
		guide: {
			install: {
				text: 'The package is not on Hex yet. Take it from the `main` branch (Elixir 1.18+, OTP 25+); it has no runtime dependencies.',
				files: [{ file: 'install/mix.exs', lang: 'elixir', title: 'mix.exs', from: 'Until the first release', to: '{:docuconf' }],
				check: 'install',
				registry: '{:docuconf, "~> 0.1"}',
			},
			declare: {
				text: 'A module with `use Docuconf` and one `env` or `secret` per variable: a type, a description and options such as `min`, `max`, `schemes` and `default`. The name is the field upcased.',
				files: [{ file: 'sdk/examples/orders/lib/orders/env.ex', lang: 'elixir', title: 'lib/orders/env.ex' }],
			},
			load: {
				text: 'Call `load!/0` in `config/runtime.exs` and put the values into your app\'s config, as you would with `System.fetch_env!/1`.',
				files: [{ file: 'sdk/examples/orders/config/runtime.exs', lang: 'elixir', title: 'config/runtime.exs' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders mix run --no-halt',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the boot stops with every problem and its error code, and the process exits 1. The report also goes to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: '`load/1` takes an `env:` map instead of the process environment, and returns `{:error, %Docuconf.ValidationError{}}` with every violation. Note that `config/runtime.exs` runs for `mix test` too: load there only `if config_env() != :test`, or give the test run a valid environment.',
				files: [{ file: 'overlay/examples/orders/test/orders_env_test.exs', lang: 'elixir', title: 'test/orders_env_test.exs' }],
				check: 'test',
			},
			export: {
				text: '`mix docuconf.export` writes `contract.cue` for the module named in `mix.exs` (`docuconf: [module: Orders.Env]`). In CI, `mix docuconf.export --check` fails when the committed file is out of date.',
				files: [{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' }],
				check: 'export',
			},
			framework: {
				name: 'Phoenix and releases',
				text: 'Phoenix reads its runtime configuration in `config/runtime.exs` already: call `MyApp.Env.load!()` at the top and pass the values to `MyAppWeb.Endpoint`, `MyApp.Repo` and the rest. It runs the same way in a `mix release`, at boot, after secrets are injected. A TLS file input gives the `certfile` and `keyfile` paths Cowboy and Bandit expect. See the [README](https://github.com/Docuconf/docuconf-elixir#readme).',
			},
		},
		ci: { image: 'elixir:1.18' },
		checks: [
			{ id: 'hex', cwd: '.', run: 'mix local.hex --force --if-missing' },
			{ id: 'install', cwd: '@install', run: 'mix deps.get && mix compile', show: 'mix deps.get' },
			{ id: 'test', cwd: 'examples/orders', run: 'DATABASE_URL=postgres://ci@db/orders mix test --no-start', show: 'mix test --no-start' },
			{ id: 'boot-error', cwd: 'examples/orders', run: 'mix compile && PORT=0 mix run --no-halt', show: 'PORT=0 mix run --no-halt', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders', run: 'mix docuconf.export' },
		],
	},
	{
		slug: 'gleam',
		name: 'Gleam',
		language: 'Gleam',
		repo: 'docuconf-gleam',
		package: 'docuconf (Hex)',
		host: 'envoy + gleam/dynamic/decode',
		hostShort: 'envoy',
		hostUrl: 'https://hexdocs.pm/envoy',
		runtime: 'Gleam 1.14 (Erlang or JavaScript)',
		types: 'all 9',
		lists: 'csv',
		durations: 'go',
		configFormats: 'json (others via a parser)',
		keystore: 'format check only',
		watch: 'not offered',
		profiles: '—',
		export: 'docuconf.write_contract()',
		conformance: '110 of 112 on Erlang, 109 on JavaScript (skips json-schema; int64 on JavaScript)',
		example: { label: 'wisp', path: 'examples/orders' },
		caveats: [
			'Keystores are not opened with their password yet.',
			'On the JavaScript target, integers beyond 2^53 lose precision.',
			'The Hex package name is shared with the Elixir SDK; one will be renamed.',
		],
		shiki: 'gleam',
		summary:
			'Gleam has no macros or reflection, so docuconf follows the decoder idiom: typed builders combined with `use`. One declaration loads the environment at boot, on Erlang or JavaScript, and writes the contract.',
		guide: {
			install: {
				text: 'The package is not on Hex yet. Take it from the `main` branch as a git dependency (Gleam 1.14+, OTP 27+ on Erlang):',
				files: [{ file: 'install/gleam.toml', lang: 'toml', title: 'gleam.toml', from: 'Until the first release', to: 'docuconf = ' }],
				check: 'install',
				registry: 'gleam add docuconf',
			},
			declare: {
				text: 'A `spec()` function: one builder per variable, piped through its constraints, then `required` or `default`, and bound with `use` the way decoders are. `secret` marks a secret.',
				files: [{ file: 'sdk/examples/orders/src/orders/config.gleam', lang: 'gleam', title: 'src/orders/config.gleam', from: 'pub type Config', to: '^}$' }],
			},
			load: {
				text: '`docuconf.load` returns the typed config, or an error listing every problem; `docuconf.describe` formats it.',
				files: [{ file: 'sdk/examples/orders/src/orders.gleam', lang: 'gleam', title: 'src/orders.gleam', from: 'let config = case docuconf.load', to: '^  }$' }],
			},
			run: 'DATABASE_URL=postgres://orders:pw@localhost:5432/orders gleam run',
			error: {
				text: 'With `PORT=0` and no `DATABASE_URL`, the service does not start. After Gleam\'s own build lines, it prints every problem with its error code and exits 1. The report also goes to `/dev/termination-log`.',
				check: 'boot-error',
			},
			test: {
				text: '`load_with` and `with_env` read a map instead of the process environment. This is a gleeunit test; add `gleeunit` to `[dev-dependencies]`.',
				files: [{ file: 'overlay/examples/orders/test/orders_test.gleam', lang: 'gleam', title: 'test/orders_test.gleam' }],
				check: 'test',
			},
			export: {
				text: 'A small module writes the contract with `docuconf.write_contract`; run it in CI.',
				files: [
					{ file: 'sdk/examples/orders/src/orders/contract.gleam', lang: 'gleam', title: 'src/orders/contract.gleam', from: 'import docuconf', to: '^}$' },
					{ file: 'sdk/examples/orders/contract.cue', lang: 'cue', title: 'contract.cue' },
				],
				check: 'export',
			},
			framework: {
				name: 'wisp and mist',
				text: 'Load the config in `main` before you start mist, and pass it to your wisp handler, as the example does. The same declaration runs on the JavaScript target, where it reads `process.env`.',
			},
		},
		ci: { image: 'ghcr.io/gleam-lang/gleam:v1.14.0-erlang', setup: 'command -v git >/dev/null || (apt-get update -qq && apt-get install -y -qq git >/dev/null)' },
		checks: [
			{ id: 'install', cwd: '@install', run: 'gleam deps download && gleam run', show: 'gleam deps download' },
			// The example has no test dependency; add gleeunit for the site's test.
			{ id: 'test-deps', cwd: 'examples/orders', run: 'printf \'\\n[dev-dependencies]\\ngleeunit = ">= 1.0.0 and < 2.0.0"\\n\' >> gleam.toml' },
			{ id: 'test', cwd: 'examples/orders', run: 'gleam test' },
			{ id: 'boot-error', cwd: 'examples/orders', run: 'PORT=0 gleam run', exit: 1, expect: true },
			{ id: 'export', cwd: 'examples/orders', run: 'gleam run -m orders/contract' },
		],
	},
];

/** The configuration every example app declares, so the same service can be compared across languages. */
export const EXAMPLE_CONFIG: { name: string; type: string; rules: string }[] = [
	{ name: 'PORT', type: 'int', rules: '1–65535, default 8080' },
	{ name: 'LOG_LEVEL', type: 'enum', rules: 'debug, info, warn, error; default info' },
	{ name: 'DATABASE_URL', type: 'url', rules: 'secret, required, scheme postgres' },
	{ name: 'ALLOWED_ORIGINS', type: 'list of strings', rules: 'at least 1 item; default http://localhost:3000' },
	{ name: 'REQUEST_TIMEOUT', type: 'duration', rules: '1s–5m, default 30s' },
	{ name: 'WORKER_COUNT', type: 'int', rules: '1–64, default 4' },
];

/** GitHub URL of a path in an SDK repository's main branch. */
export const repoPath = (repo: string, path: string) => `${GITHUB_ORG}/${repo}/tree/main/${path}`;

/** The raw README, for tools and language models. */
export const readmeRaw = (row: SdkRow) =>
	`${GITHUB_ORG.replace('github.com', 'raw.githubusercontent.com')}/${row.repo}/main/${row.readme ?? 'README.md'}`;

/** One status for every SDK: they are all unreleased v0.1 alphas, told apart by conformance. */
export const sdkStatus = (row: SdkRow) => `v0.1 alpha, not yet released · conformance ${row.conformance}`;

/** The shortest conformance figure, such as "112/112". */
export const conformanceShort = (row: SdkRow) => {
	const m = row.conformance.match(/^(\d+) of (\d+)/);
	return m ? `${m[1]}/${m[2]}` : row.conformance;
};

/** SDKs grouped by language, for lists that name each language once. */
export const LANGUAGES = [...new Set(SDK_ROWS.map((r) => r.language))].map((language) => ({
	language,
	rows: SDK_ROWS.filter((r) => r.language === language),
}));
