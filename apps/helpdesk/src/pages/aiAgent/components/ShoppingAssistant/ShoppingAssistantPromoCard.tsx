import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { TrialSharedModals } from 'pages/aiAgent/components/ShoppingAssistant/components/TrialSharedModals'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import RequestTrialModal from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import {
    AdminDemo,
    AdminTrial,
    AdminTrialProgress,
    LeadNotify,
    LeadTrialProgress,
} from './components'
import { useTrialPromoCard } from './hooks/useTrialPromoCard'
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
        trialAccess,
    } = useTrialPromoCard(shopName, allShopifyIntegrations, routeShopName)

    if (isShoppingAssitantDeactivationEnforced || isLoading || !promoContent) {
        return null
    }

    const sharedContent = (
        <TrialSharedModals
            shopName={shopName}
            trialType={trialAccess.trialType}
            trialModalProps={trialModalProps}
        />
    )
    const { variant } = promoContent
    let variantComponent: React.ReactNode = null

    const getStoreSpecificStorageKey = (variant: PromoCardVariant) => {
        const baseKey = `shopping-assistant-promo-${variant.toLowerCase()}-dismissed`
        return shopName ? `${baseKey}-${shopName}` : baseKey
    }

    switch (variant) {
        case PromoCardVariant.AdminTrialProgress:
            variantComponent = (
                <>
                    <AdminTrialProgress
                        className={className}
                        promoContent={promoContent}
                        trialType={trialAccess.trialType}
                    />
                </>
            )
            break

        case PromoCardVariant.LeadTrialProgress:
            variantComponent = (
                <>
                    <LeadTrialProgress
                        className={className}
                        promoContent={promoContent}
                        trialType={trialAccess.trialType}
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
                        trialType={trialAccess.trialType}
                        storageKey={getStoreSpecificStorageKey(variant)}
                    />
                </>
            )
            break

        case PromoCardVariant.AdminDemo:
            variantComponent = (
                <AdminDemo
                    className={className}
                    promoContent={promoContent}
                    trialType={trialAccess.trialType}
                    storageKey={getStoreSpecificStorageKey(variant)}
                />
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
                        trialType={trialAccess.trialType}
                        storageKey={getStoreSpecificStorageKey(variant)}
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
            {sharedContent}
        </>
    )
}
