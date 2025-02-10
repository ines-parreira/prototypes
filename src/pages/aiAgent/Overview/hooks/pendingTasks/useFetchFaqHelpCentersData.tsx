import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'

type Args = {
    enabled: boolean
}
/** Fetch all help-centers and filter out only the one that are  */
export const useFetchFaqHelpCentersData = ({enabled}: Args) => {
    const {isLoading, data} = useGetHelpCenterList(
        {type: 'faq', per_page: HELP_CENTER_MAX_CREATION},
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            enabled,
        }
    )

    return {
        data: data?.data.data,
        isLoading,
    }
}

export type FaqHelpCentersData = Exclude<
    Awaited<ReturnType<typeof useFetchFaqHelpCentersData>>['data'],
    null | undefined
>
