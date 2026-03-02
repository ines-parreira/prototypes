import { useMemo } from 'react'

import {
    useGetHelpCenter,
    useGetHelpCenterCategoryTree,
} from 'models/helpCenter/queries'
import type {
    CategoryWithLocalTranslation,
    Locale,
} from 'models/helpCenter/types'

export function useFaqHelpCenterData(helpCenterId: number, enabled = true) {
    const { data: helpCenter, isLoading: isHelpCenterLoading } =
        useGetHelpCenter(
            helpCenterId,
            {},
            { enabled: enabled && !!helpCenterId },
        )

    const { data: categoryTree, isLoading: isCategoryTreeLoading } =
        useGetHelpCenterCategoryTree(
            helpCenter?.id || 0,
            0,
            {
                locale:
                    (helpCenter?.default_locale as Locale['code']) || 'en-US',
                order_by: 'position',
                order_dir: 'asc',
            },
            { enabled: enabled && !!helpCenter?.id },
        )

    const categories = useMemo(() => {
        if (!categoryTree?.children) return []
        return categoryTree.children.map(
            (cat: CategoryWithLocalTranslation) => ({
                ...cat,
                children:
                    cat.children?.map(
                        (child: CategoryWithLocalTranslation) => child.id,
                    ) || [],
                articleCount: 0,
            }),
        )
    }, [categoryTree])

    const locales: Locale[] = useMemo(() => {
        if (!helpCenter) return []
        return [
            {
                code: helpCenter.default_locale as Locale['code'],
                name: helpCenter.default_locale,
            },
        ]
    }, [helpCenter])

    return {
        helpCenter,
        categories,
        locales,
        isLoading: isHelpCenterLoading || isCategoryTreeLoading,
    }
}
