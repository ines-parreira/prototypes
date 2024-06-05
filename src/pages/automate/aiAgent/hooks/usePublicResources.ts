import {useMemo} from 'react'
import {useGetArticleIngestionLogs} from 'models/helpCenter/queries'
import {mapArticleIngestionLogsToSourceItem} from '../components/PublicSourcesSection/utils'

export const usePublicResources = ({helpCenterId}: {helpCenterId: number}) => {
    const {data: articleIngestionLogs} = useGetArticleIngestionLogs({
        help_center_id: helpCenterId,
    })

    const sourceItems = useMemo(
        () =>
            articleIngestionLogs
                ? articleIngestionLogs.data.map(
                      mapArticleIngestionLogsToSourceItem
                  )
                : undefined,
        [articleIngestionLogs]
    )

    return {sourceItems}
}
