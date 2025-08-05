import React from 'react'

import {
    AdminDemo,
    AdminTrial,
    AdminTrialProgress,
    LeadNotify,
    LeadTrialProgress,
} from './components'
import {
    PromoCardVariant,
    useShoppingAssistantPromoCard,
} from './hooks/useShoppingAssistantPromoCard'

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
    const promoContent = useShoppingAssistantPromoCard()

    if (!promoContent) {
        return null
    }

    const { variant } = promoContent

    switch (variant) {
        case PromoCardVariant.AdminTrialProgress:
            return (
                <AdminTrialProgress
                    className={className}
                    promoContent={promoContent}
                />
            )

        case PromoCardVariant.LeadTrialProgress:
            return (
                <LeadTrialProgress
                    className={className}
                    promoContent={promoContent}
                />
            )

        case PromoCardVariant.AdminTrial:
            return (
                <AdminTrial className={className} promoContent={promoContent} />
            )

        case PromoCardVariant.AdminDemo:
            return (
                <AdminDemo className={className} promoContent={promoContent} />
            )

        case PromoCardVariant.LeadNotify:
            return (
                <LeadNotify className={className} promoContent={promoContent} />
            )

        case PromoCardVariant.Hidden:
            return null

        default:
            return null
    }
}
