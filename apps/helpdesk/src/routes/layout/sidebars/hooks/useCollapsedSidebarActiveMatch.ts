import { useMemo } from 'react'

import { matchPath, useLocation } from 'react-router-dom'

export function useCollapsedSidebarActiveMatch<TItem extends { id: string }>(
    sections: Array<{ id: string; route?: string; items?: TItem[] }>,
    getItemPath: (item: TItem) => string,
    getSectionPath?: (section: {
        id: string
        route?: string
    }) => string | undefined,
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

            const sectionPath = getSectionPath?.(section)
            if (sectionPath && matchPath(pathname, { path: sectionPath })) {
                return {
                    sectionId: section.id,
                    itemId: section.id,
                }
            }
        }
    }, [pathname, sections, getItemPath, getSectionPath])
}
