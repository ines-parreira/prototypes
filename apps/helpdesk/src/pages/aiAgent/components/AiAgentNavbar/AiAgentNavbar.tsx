import { FeatureFlagKey } from '@repo/feature-flags'

import { ActiveContent, Navbar } from 'common/navigation'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { PostOnboardingUserNudges } from 'pages/aiAgent/Overview/components/PostOnboardingUserNudges/PostOnboardingUserNudges'
import { getHasAutomate } from 'state/billing/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { ShoppingAssistantPromoCard } from '../ShoppingAssistant/ShoppingAssistantPromoCard'
import { ActionDrivenNavigation } from './ActionDrivenNavigation'

import css from './AiAgentNavbar.less'

export const AiAgentNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview = useFlag(FeatureFlagKey.AIAgentPreviewModeAllowed)

    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    if (
        !(
            hasAutomate ||
            hasAiAgentPreview ||
            isAiAgentExpandingTrialExperienceForAllEnabled
        ) ||
        storeIntegrations.length === 0
    ) {
        return <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent" />
    }

    return (
        <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent">
            <div className={css.container}>
                <div className={css.scrollableContent}>
                    <ActionDrivenNavigation />
                </div>
                <div className={css.stickyPromoCard}>
                    <ShoppingAssistantPromoCard className={css.promoCard} />
                </div>

                <PostOnboardingUserNudges />
            </div>
        </Navbar>
    )
}
