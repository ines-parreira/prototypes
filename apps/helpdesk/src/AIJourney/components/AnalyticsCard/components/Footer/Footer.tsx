import { CartAbandonedJourneyConfigurationApiDTO } from '@gorgias/convert-client'

import { DiscountCard } from 'AIJourney/components/DiscountCard/DiscountCard'
import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'

import css from './Footer.less'

type FooterProps = {
    isDiscountEnabled?: boolean
    journeyType?: string
    maxDiscount?: CartAbandonedJourneyConfigurationApiDTO['max_discount_percent']
    totalRevenue?: MetricProps
}

export const Footer = ({
    isDiscountEnabled,
    journeyType,
    maxDiscount,
    totalRevenue,
}: FooterProps) => {
    return (
        <div className={css.footer}>
            <DiscountCard
                totalRevenue={totalRevenue}
                isDiscountEnabled={isDiscountEnabled}
                maxDiscount={maxDiscount}
                journeyType={journeyType}
            />
        </div>
    )
}
