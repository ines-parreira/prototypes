import React, {useState} from 'react'

import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import AutomationSubscriptionButton from 'pages/settings/billing/automate/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automate/AutomationSubscriptionModal'
import {assetsUrl} from 'utils'
import {ARTICLE_RECOMMENDATION} from '../common/components/constants'

const ArticleRecommendationPaywallView = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    return (
        <Paywall
            pageHeader={ARTICLE_RECOMMENDATION}
            header="Automate up to 25% of interactions with advanced automation features"
            description="Leverage AI to automatically recommend relevant Help Center articles to customers."
            previewImage={assetsUrl(
                '/img/paywalls/screens/article-recommendation.png'
            )}
            requiredUpgrade="Automation"
            upgradeType={UpgradeType.AddOn}
            showUpgradeCta
            renderFilterShadow
            customCta={
                <AutomationSubscriptionButton
                    onClick={() => {
                        setIsAutomationModalOpened(true)
                    }}
                    label="Get Automate Features"
                />
            }
            modal={
                <AutomationSubscriptionModal
                    confirmLabel="Subscribe"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
            }
        />
    )
}

export default withCanduPaywall({
    title: ARTICLE_RECOMMENDATION,
    canduId: 'article-recommendation-paywall',
})(ArticleRecommendationPaywallView)
