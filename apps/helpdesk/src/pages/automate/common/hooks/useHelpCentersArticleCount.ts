import { useEffect, useState } from 'react'

import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

export const useHelpCentersArticleCount = (helpCenterIds?: number[]) => {
    const { client } = useHelpCenterApi()

    const [articlesCount, setArticlesCount] = useState<
        Array<{ helpCenterId: number; count?: number }> | undefined
    >()

    useEffect(() => {
        let isCurrent = true

        if (helpCenterIds === undefined || !client) {
            return
        }

        const fetchArticleCounts = async () => {
            const results = await Promise.all(
                helpCenterIds.map(async (helpCenterId) => {
                    try {
                        const data = await client.listArticles({
                            help_center_id: helpCenterId,
                            per_page: 1,
                            page: 1,
                        })
                        return {
                            helpCenterId,
                            count: data.data.meta.item_count,
                        }
                    } catch {
                        return { helpCenterId }
                    }
                }),
            )

            if (isCurrent) {
                setArticlesCount(results)
            }
        }

        void fetchArticleCounts()

        return () => {
            isCurrent = false
        }
    }, [client, helpCenterIds])

    return articlesCount
}
