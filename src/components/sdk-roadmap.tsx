// Lists of SDKs for prose pages, from src/lib/sdk-data.ts, so no page names languages by hand.
import Link from 'next/link';
import { GITHUB_ORG, LANGUAGES, SDK_ROWS } from '@/lib/sdk-data';

export const SdkCount = () => <>{SDK_ROWS.length}</>;

/** "Go, TypeScript (T3 Env and NestJS), .NET, ..." */
export function SdkList() {
	return (
		<>
			{LANGUAGES.map((l, i) => (
				<span key={l.language}>
					{i > 0 && (i === LANGUAGES.length - 1 ? ' and ' : ', ')}
					{l.language}
					{l.rows.length > 1 && ` (${l.rows.map((r) => r.hostShort).join(' and ')})`}
				</span>
			))}
		</>
	);
}

/** The roadmap's language checklist: every SDK is built; none is released. */
export function SdkRoadmap() {
	return (
		<ul className="contains-task-list">
			{SDK_ROWS.map((r) => (
				<li key={r.slug} className="task-list-item">
					<span className="task-mark">
						<span aria-hidden="true">✓</span>
						<span className="sr-only">Done: </span>
					</span>
					<Link href={`/languages/${r.slug}/`}>{r.name}</Link> on {r.host}
				</li>
			))}
			<li className="task-list-item">
				<span className="task-mark">
					<span aria-hidden="true">○</span>
					<span className="sr-only">To do: </span>
				</span>
				First releases to each package registry
			</li>
		</ul>
	);
}

export function SdkRepoList() {
	return (
		<ul>
			{SDK_ROWS.filter((r, i) => SDK_ROWS.findIndex((x) => x.repo === r.repo) === i).map((r) => (
				<li key={r.repo}>
					<a href={`${GITHUB_ORG}/${r.repo}`}>
						<code>{r.repo}</code>
					</a>
					: {SDK_ROWS.filter((x) => x.repo === r.repo).map((x) => x.name).join(' and ')}
				</li>
			))}
		</ul>
	);
}
