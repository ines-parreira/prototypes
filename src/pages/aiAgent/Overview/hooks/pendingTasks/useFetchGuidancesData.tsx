import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {useGuidanceArticles} from 'pages/aiAgent/hooks/useGuidanceArticles'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'

type Args = {
    storeName: string
    enabled: boolean
}
export const useFetchGuidancesData = ({storeName, enabled}: Args) => {
    const {isLoading: isLoadingGuidanceHelpCenter, data: guidanceHelpCenter} =
        useGetHelpCenterList(
            {
                type: 'guidance',
                per_page: HELP_CENTER_MAX_CREATION,
                shop_name: storeName,
            },
            {
                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
                enabled,
            }
        )

    const guidanceHelpCenterId = guidanceHelpCenter?.data?.data[0]?.id

    const {guidanceArticles, isGuidanceArticleListLoading} =
        useGuidanceArticles(guidanceHelpCenterId!, {
            enabled: !!guidanceHelpCenterId,
        })

    return {
        data: guidanceArticles,
        isLoading: isGuidanceArticleListLoading || isLoadingGuidanceHelpCenter,
    }
}

export type GuidancesData = Exclude<
    Awaited<ReturnType<typeof useFetchGuidancesData>>['data'],
    null | undefined
>
