import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { ActiveContent, Navbar } from 'common/navigation'
import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { ShoppingAssistantPromoCard } from '../ShoppingAssistant/ShoppingAssistantPromoCard'
import { ActionDrivenNavigation } from './ActionDrivenNavigation'

import css from './AiAgentNavbar.less'

export const AiAgentNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    if (
        (!hasAutomate && !hasAiAgentPreview) ||
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
            </div>
        </Navbar>
    )
}
