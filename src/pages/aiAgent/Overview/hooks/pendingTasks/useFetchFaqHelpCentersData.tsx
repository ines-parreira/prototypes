import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'

type Args = {
    enabled: boolean
    retries?: boolean
}
/** Fetch all help-centers and filter out only the one that are  */
export const useFetchFaqHelpCentersData = ({
    enabled,
    retries = true,
}: Args) => {
    const { isLoading, isFetched, data } = useGetHelpCenterList(
        { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            enabled,
            ...(!retries && { retry: 0 }),
        },
    )

    return {
        data: data?.data.data,
        isLoading,
        isFetched,
    }
}

export type FaqHelpCentersData = Exclude<
    Awaited<ReturnType<typeof useFetchFaqHelpCentersData>>['data'],
    null | undefined
>
