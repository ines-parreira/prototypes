import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { reportError } from 'utils/errors'

const FIVE_MINUTES = 1000 * 60 * 5

type HelpCenterType = 'guidance' | 'snippet' | 'faq'

type UseAiAgentHelpCenterParams = {
    shopName: string
    helpCenterType: HelpCenterType
    enabled?: boolean
}

export const useAiAgentHelpCenterState = ({
    shopName,
    helpCenterType,
    enabled = true,
}: UseAiAgentHelpCenterParams): {
    helpCenter: HelpCenter | undefined
    isLoading: boolean
} => {
    // We expect to handle only 1 guidance help center
    const { data, isLoading, isFetching } = useGetHelpCenterList(
        { type: helpCenterType, per_page: 1, shop_name: shopName },
        {
            // Guidance Help Center is not expected to change frequently
            staleTime: FIVE_MINUTES,
            enabled,
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

    return {
        helpCenter,
        isLoading: !helpCenter && (isLoading || isFetching),
    }
}

export const useAiAgentHelpCenter = ({
    shopName,
    helpCenterType,
    enabled = true,
}: UseAiAgentHelpCenterParams): HelpCenter | undefined => {
    const { helpCenter } = useAiAgentHelpCenterState({
        shopName,
        helpCenterType,
        enabled,
    })

    return helpCenter
}
