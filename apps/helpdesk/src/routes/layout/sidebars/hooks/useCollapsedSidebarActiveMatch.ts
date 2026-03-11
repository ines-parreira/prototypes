import { useMemo } from 'react'

import { matchPath, useLocation } from 'react-router-dom'

export function useCollapsedSidebarActiveMatch<TItem extends { id: string }>(
    sections: Array<{ id: string; items?: TItem[] }>,
    getItemPath: (item: TItem) => string,
): { sectionId: string; itemId: string } | undefined {
    const { pathname } = useLocation()

    return useMemo(() => {
        for (const section of sections) {
            const activeItem = section.items?.find((item) =>
                matchPath(pathname, { path: getItemPath(item) }),
            )
            if (activeItem) {
                return {
                    sectionId: section.id,
                    itemId: activeItem.id,
                }
            }
        }
    }, [pathname, sections, getItemPath])
}
