// Every spec version's pages and data, by version. A version listed in src/lib/spec-versions.ts has one entry
// here: its data.ts and one MDX file per page in SPEC_PAGES. Pages link to other spec pages as /spec/<page>/;
// the route rewrites those links to the version being read.
import type { MDXProps } from 'mdx/types';
import type { JSX } from 'react';
import type { SpecData } from '@/lib/spec-data';
import { CURRENT_SPEC } from '@/lib/spec-versions';
import { SPEC as V1ALPHA1 } from './v1alpha1/data';
import { SPEC as V1BETA1 } from './v1beta1/data';

export type SpecPageModule = {
	default: (props: MDXProps) => JSX.Element;
	metadata: { title: string; description: string };
};

type Load = () => Promise<SpecPageModule>;

export const SPEC_CONTENT: Record<string, { data: SpecData; pages: Record<string, Load> }> = {
	v1alpha1: {
		data: V1ALPHA1,
		pages: {
			overview: () => import('./v1alpha1/overview.mdx') as Promise<SpecPageModule>,
			inputs: () => import('./v1alpha1/inputs.mdx') as Promise<SpecPageModule>,
			outputs: () => import('./v1alpha1/outputs.mdx') as Promise<SpecPageModule>,
			'generated-docs': () => import('./v1alpha1/generated-docs.mdx') as Promise<SpecPageModule>,
			'sdk-requirements': () => import('./v1alpha1/sdk-requirements.mdx') as Promise<SpecPageModule>,
		},
	},
	v1beta1: {
		data: V1BETA1,
		pages: {
			overview: () => import('./v1beta1/overview.mdx') as Promise<SpecPageModule>,
			inputs: () => import('./v1beta1/inputs.mdx') as Promise<SpecPageModule>,
			outputs: () => import('./v1beta1/outputs.mdx') as Promise<SpecPageModule>,
			'generated-docs': () => import('./v1beta1/generated-docs.mdx') as Promise<SpecPageModule>,
			'sdk-requirements': () => import('./v1beta1/sdk-requirements.mdx') as Promise<SpecPageModule>,
		},
	},
};

/** A version's data; the current version's when the version is unknown. */
export const specData = (version: string): SpecData => (SPEC_CONTENT[version] ?? SPEC_CONTENT[CURRENT_SPEC.version]).data;
