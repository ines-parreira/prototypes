import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HelpCenter} from 'models/helpCenter/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'

const FIVE_MINUTES = 1000 * 60 * 5

export const useAiAgentHelpCenter = ({
    shopName,
    helpCenterType,
}: {
    shopName: string
    helpCenterType: 'guidance' | 'snippet'
}): HelpCenter | undefined => {
    const dispatch = useAppDispatch()

    // We expect to handle only 1 guidance help center
    const {data} = useGetHelpCenterList(
        {type: helpCenterType, per_page: 1, shop_name: shopName},
        {
            // Guidance Help Center is not expected to change frequently
            staleTime: FIVE_MINUTES,
            onSuccess: (data) => {
                const helpCenter = data?.data.data[0]

                if (!helpCenter) {
                    reportError(
                        new Error(
                            `${helpCenterType} Help Center not found for shop: ${shopName}`
                        ),
                        {
                            tags: {team: AI_AGENT_SENTRY_TEAM},
                            extra: {
                                context: `Error during fetching of ${helpCenterType} help center`,
                            },
                            level: 'error',
                        }
                    )
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: `${helpCenterType} Help Center not found for shop: ${shopName}. Please try again or contact support.`,
                        })
                    )
                }
            },
        }
    )
    const helpCenter = data?.data.data[0]

    return helpCenter
}
