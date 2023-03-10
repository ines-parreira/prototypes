import {useEffect, useState} from 'react'

import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

export const useHelpCenterPublishedArticlesCount = (
    helpCenterId: Maybe<number>
) => {
    const {client} = useHelpCenterApi()

    const [articlesCountByHelpCenter, setArticlesCountByHelpCenter] = useState<{
        [helpCenterId: string]: number
    }>({})

    const hasArticlesCountByHelpCenter = Boolean(
        helpCenterId &&
            articlesCountByHelpCenter[helpCenterId.toString()] !== undefined
    )

    useEffect(() => {
        if (!client || !helpCenterId || hasArticlesCountByHelpCenter) {
            return
        }

        if (!client) {
            return
        }

        void client
            .listArticles({
                help_center_id: helpCenterId,
                version_status: 'current',
                per_page: 1,
                page: 1,
            })
            .then(({data}) => {
                setArticlesCountByHelpCenter((previous) => ({
                    ...previous,
                    [helpCenterId.toString()]: data.meta.item_count,
                }))
            })
            .catch(console.error)
    }, [client, helpCenterId, hasArticlesCountByHelpCenter])

    if (!helpCenterId) {
        return undefined
    }

    return articlesCountByHelpCenter[helpCenterId.toString()]
}
