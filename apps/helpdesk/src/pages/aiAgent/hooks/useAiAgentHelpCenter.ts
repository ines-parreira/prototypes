import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { reportError } from 'utils/errors'

const FIVE_MINUTES = 1000 * 60 * 5

export const useAiAgentHelpCenter = ({
    shopName,
    helpCenterType,
}: {
    shopName: string
    helpCenterType: 'guidance' | 'snippet' | 'faq'
}): HelpCenter | undefined => {
    // We expect to handle only 1 guidance help center
    const { data } = useGetHelpCenterList(
        { type: helpCenterType, per_page: 1, shop_name: shopName },
        {
            // Guidance Help Center is not expected to change frequently
            staleTime: FIVE_MINUTES,
            onSuccess: (data) => {
                const helpCenter = data?.data.data[0]

                // FAQ help centers are optional, don't report error when missing
                if (!helpCenter && helpCenterType !== 'faq') {
                    reportError(
                        new Error(
                            `${helpCenterType} Help Center not found for shop: ${shopName}`,
                        ),
                        {
                            tags: { team: SentryTeam.AI_AGENT },
                            extra: {
                                context: `Error during fetching of ${helpCenterType} help center`,
                            },
                            level: 'error',
                        },
                    )
                }
            },
        },
    )
    const helpCenter = data?.data.data[0]

    return helpCenter
}
