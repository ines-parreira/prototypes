import React from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { TrialEndedModal } from 'pages/aiAgent/trial/components/TrialEndedModal/TrialEndedModal'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import RequestTrialModal from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import TrialFinishSetupModal from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import {
    AdminDemo,
    AdminTrial,
    AdminTrialProgress,
    LeadNotify,
    LeadTrialProgress,
} from './components'
import { TrialProgressModals } from './components/TrialProgressModals'
import { useShoppingAssistantPromoCard } from './hooks/useShoppingAssistantPromoCard'
import { PromoCardVariant } from './types/ShoppingAssistant'
import { extractShopNameFromUrl } from './utils/extractShopNameFromUrl'

interface ShoppingAssistantPromoCardProps {
    className?: string
}

/**
 * Dynamic promo card component that shows different content based on user role and subscription.
 * Uses a switch statement to render the appropriate component variant.
 */
export const ShoppingAssistantPromoCard: React.FC<
    ShoppingAssistantPromoCardProps
> = ({ className }) => {
    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    const routeShopName = extractShopNameFromUrl(window.location.href)
    const shopName = routeShopName || allShopifyIntegrations[0]?.meta?.shop_name

    const isShoppingAssistantDuringTrialEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantDuringTrial,
        false,
    )

    const isShoppingAssitantDeactivationEnforced = useFlag(
        FeatureFlagKey.ShoppingAssistantEnforceDeactivation,
        false,
    )

    const trialModalProps = useTrialModalProps({
        storeName: shopName,
    })

    const {
        promoCardContent: promoContent,
        trialFlow,
        isLoading,
    } = useShoppingAssistantPromoCard(
        shopName,
        allShopifyIntegrations,
        routeShopName,
    )

    if (isShoppingAssitantDeactivationEnforced || isLoading || !promoContent) {
        return null
    }

    const sharedContent = isShoppingAssistantDuringTrialEnabled ? (
        <>
            <TrialEndedModal storeName={shopName} />
            <TrialProgressModals storeName={shopName} />
        </>
    ) : null
    const { variant } = promoContent

    let variantComponent: React.ReactNode = null

    switch (variant) {
        case PromoCardVariant.AdminTrialProgress:
            if (!isShoppingAssistantDuringTrialEnabled) {
                break
            }

            variantComponent = (
                <>
                    <AdminTrialProgress
                        className={className}
                        promoContent={promoContent}
                    />
                </>
            )
            break

        case PromoCardVariant.LeadTrialProgress:
            if (!isShoppingAssistantDuringTrialEnabled) {
                break
            }

            variantComponent = (
                <>
                    <LeadTrialProgress
                        className={className}
                        promoContent={promoContent}
                    />
                </>
            )
            break

        case PromoCardVariant.AdminTrial:
            variantComponent = (
                <>
                    <TrialTryModal
                        {...trialModalProps.newTrialUpgradePlanModal}
                        isOpen={trialFlow.isTrialModalOpen}
                    />
                    <AdminTrial
                        className={className}
                        promoContent={promoContent}
                    />
                </>
            )
            break

        case PromoCardVariant.AdminDemo:
            variantComponent = (
                <AdminDemo className={className} promoContent={promoContent} />
            )
            break

        case PromoCardVariant.LeadNotify:
            variantComponent = (
                <>
                    <RequestTrialModal
                        {...trialModalProps.trialRequestModal}
                        isOpen={trialFlow.isTrialRequestModalOpen}
                        onClose={trialFlow.closeTrialRequestModal}
                    />
                    <LeadNotify
                        className={className}
                        promoContent={promoContent}
                    />
                </>
            )
            break

        case PromoCardVariant.Hidden:
        default:
            return sharedContent
    }

    return (
        <>
            {variantComponent}
            <TrialFinishSetupModal
                {...trialModalProps.trialFinishSetupModal}
                isOpen={trialFlow.isTrialFinishSetupModalOpen}
                onClose={trialFlow.closeTrialFinishSetupModal}
            />
            {sharedContent}
        </>
    )
}
