'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

/** The docs sidebar under 1024px, folded into a disclosure that closes when the page changes. */
export function MobileDocsNav({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const ref = useRef<HTMLDetailsElement>(null);
	useEffect(() => {
		if (ref.current) ref.current.open = false;
	}, [pathname]);
	return (
		<details ref={ref} className="mb-4 rounded-xl border border-border px-4 py-2">
			<summary className="cursor-pointer text-sm font-medium">Docs menu</summary>
			<div className="pb-2 pt-3">{children}</div>
		</details>
	);
}
