import { useSidebar } from '@repo/navigation'

import { Box } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { ActionDrivenNavigation } from 'pages/aiAgent/components/AiAgentNavbar/ActionDrivenNavigation'
import { ShoppingAssistantPromoCard } from 'pages/aiAgent/components/ShoppingAssistant/ShoppingAssistantPromoCard'
import { PostOnboardingUserNudges } from 'pages/aiAgent/Overview/components/PostOnboardingUserNudges/PostOnboardingUserNudges'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import css from './AiAgentSidebar.less'

export function AiAgentSidebar() {
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)
    const { isCollapsed } = useSidebar()

    if (storeIntegrations.length === 0) {
        return null
    }

    return (
        <Box
            flexDirection="column"
            justifyContent="space-between"
            height="100%"
            gap="sm"
        >
            {isCollapsed ? (
                <ActionDrivenNavigation />
            ) : (
                <>
                    <Box
                        flexDirection="column"
                        className={css.scrollableContent}
                    >
                        <ActionDrivenNavigation />
                    </Box>
                    <Box width="100%" justifyContent="center">
                        <ShoppingAssistantPromoCard className={css.promoCard} />
                    </Box>

                    <PostOnboardingUserNudges />
                </>
            )}
        </Box>
    )
}
