import type {
    JourneyConfigurationApiDTO,
    JourneyTypeEnum,
} from '@gorgias/convert-client'

import { DiscountCard } from 'AIJourney/components/DiscountCard/DiscountCard'
import { JOURNEY_TYPES_MAP_TO_URL } from 'AIJourney/constants'
import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'

import css from './Footer.less'

type FooterProps = {
    isDiscountEnabled?: boolean
    journeyType: JourneyTypeEnum
    maxDiscount?: JourneyConfigurationApiDTO['max_discount_percent']
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
                journeyType={JOURNEY_TYPES_MAP_TO_URL[journeyType]}
            />
        </div>
    )
}
