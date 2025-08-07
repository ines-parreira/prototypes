import React from 'react'

import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import RequestTrialModal from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import TrialFinishSetupModal from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'

import {
    AdminDemo,
    AdminTrial,
    AdminTrialProgress,
    LeadNotify,
    LeadTrialProgress,
} from './components'
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
    const shopName = extractShopNameFromUrl(window.location.href)

    const trialModalProps = useTrialModalProps({
        storeName: shopName,
    })

    const { promoCardContent: promoContent, trialFlow } =
        useShoppingAssistantPromoCard(shopName)

    if (!promoContent) {
        return null
    }

    const { variant } = promoContent

    let variantComponent: React.ReactNode = null

    switch (variant) {
        case PromoCardVariant.AdminTrialProgress:
            variantComponent = (
                <AdminTrialProgress
                    className={className}
                    promoContent={promoContent}
                />
            )
            break

        case PromoCardVariant.LeadTrialProgress:
            variantComponent = (
                <LeadTrialProgress
                    className={className}
                    promoContent={promoContent}
                />
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
            return null
    }

    return (
        <>
            {variantComponent}
            <TrialFinishSetupModal
                {...trialModalProps.trialFinishSetupModal}
                isOpen={trialFlow.isTrialFinishSetupModalOpen}
                onClose={trialFlow.closeTrialFinishSetupModal}
            />
        </>
    )
}
