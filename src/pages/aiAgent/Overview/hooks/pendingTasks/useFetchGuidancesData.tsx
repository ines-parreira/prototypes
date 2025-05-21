import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'

type Args = {
    storeName: string
    enabled: boolean
    refetchOnWindowFocus?: boolean
    retries?: boolean
}
export const useFetchGuidancesData = ({
    storeName,
    enabled,
    refetchOnWindowFocus = true,
    retries = true,
}: Args) => {
    const {
        isLoading: isLoadingGuidanceHelpCenter,
        data: guidanceHelpCenter,
        isFetched: isFetchedGuidanceHelpCenter,
    } = useGetHelpCenterList(
        {
            type: 'guidance',
            per_page: HELP_CENTER_MAX_CREATION,
            shop_name: storeName,
        },
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            enabled,
            ...(!retries && { retry: 0 }),
        },
    )

    const guidanceHelpCenterId = guidanceHelpCenter?.data?.data[0]?.id

    const { guidanceArticles, isGuidanceArticleListLoading, isFetched } =
        useGuidanceArticles(guidanceHelpCenterId!, {
            enabled: !!guidanceHelpCenterId,
            refetchOnWindowFocus,
            ...(!retries && { retry: 0 }),
        })

    return {
        data: guidanceArticles,
        isLoading: isGuidanceArticleListLoading || isLoadingGuidanceHelpCenter,
        isFetched: isFetchedGuidanceHelpCenter || isFetched,
    }
}

export type GuidancesData = Exclude<
    Awaited<ReturnType<typeof useFetchGuidancesData>>['data'],
    null | undefined
>
