import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HelpCenter} from 'models/helpCenter/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'

const FIVE_MINUTES = 1000 * 60 * 5

export const useGuidanceHelpCenter = ({
    shopName,
}: {
    shopName: string
}): HelpCenter | undefined => {
    const dispatch = useAppDispatch()

    // We expect to handle only 1 guidance help center
    const {data} = useGetHelpCenterList(
        {type: 'guidance', per_page: 1, shop_name: shopName},
        {
            // Guidance Help Center is not expected to change frequently
            staleTime: FIVE_MINUTES,
            onSuccess: (data) => {
                const guidanceHelpCenter = data?.data.data[0]

                if (!guidanceHelpCenter) {
                    reportError(
                        `Guidance Help Center not found for shop: ${shopName}`,
                        {
                            tags: {team: AI_AGENT_SENTRY_TEAM},
                            extra: {
                                context:
                                    'Error during fetching of guidance help center',
                            },
                            level: 'error',
                        }
                    )
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: `Guidance Help Center not found for shop: ${shopName}. Please try again or contact support.`,
                        })
                    )
                }
            },
        }
    )
    const guidanceHelpCenter = data?.data.data[0]

    return guidanceHelpCenter
}
