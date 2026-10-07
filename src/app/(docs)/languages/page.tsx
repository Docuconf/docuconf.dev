// /languages/: pick a language. Generated from src/lib/sdk-data.ts.
import Link from 'next/link';
import { JsonLd } from '@/components/spec-tables';
import { LanguagePicker } from '@/components/language-picker';
import { SDK_ROWS } from '@/lib/sdk-data';
import { pageGraph } from '@/lib/seo';

const description = `Get started with docuconf in your language: ${SDK_ROWS.length} SDKs, each built on the config library that ecosystem already uses. Install, declare, see an error, test and export, in five minutes.`;

export const metadata = {
	title: 'Get started',
	description,
	alternates: { canonical: '/languages/' },
};

export default function Languages() {
	return (
		<>
			<JsonLd data={pageGraph({ path: '/languages/', title: 'Get started', description })} />
			<h1>Get started</h1>
			<p className="lead">
				Pick your language. Each SDK builds on the library that ecosystem already trusts: that library keeps loading
				and parsing, and docuconf adds descriptions, secrets, constraints, boot checks and contract export.
			</p>
			<LanguagePicker />
			<p>
				Each page takes the same steps, in the same order: install, declare, load at boot, run it and see an error, test
				it, export the contract, and fit it into your framework. Every snippet is compiled or run against the SDK&apos;s{' '}
				<code>main</code> branch in CI.
			</p>
			<p>
				All {SDK_ROWS.length} SDKs are v0.1 alphas and none is on a package registry yet, so each page installs from git.
				They implement the same <Link href="/spec/">specification</Link> and pass the shared conformance suite; the{' '}
				<Link href="/spec/sdk-requirements/">SDK requirements</Link> page compares what each one supports.
			</p>
			<h2 id="not-here">Your language is not here?</h2>
			<p>
				Any language can have an SDK. The specification says what an SDK must do, and the shared conformance suite checks
				it mechanically. See <Link href="/community/">Get involved</Link>.
			</p>
		</>
	);
}
