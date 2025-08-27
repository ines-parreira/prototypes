import { CartAbandonedJourneyConfigurationApiDTO } from '@gorgias/convert-client'

import css from './Footer.less'

type FooterProps = {
    isDiscountEnabled?: boolean
    maxDiscount?: CartAbandonedJourneyConfigurationApiDTO['max_discount_percent']
}

export const Footer = ({ isDiscountEnabled, maxDiscount }: FooterProps) => {
    return (
        <div className={css.footer}>
            {isDiscountEnabled && (
                <div className={css.discountInfo}>
                    <div className={css.discountInfoIcon}>
                        <i
                            style={{ fontSize: '12px' }}
                            className="material-icons-outlined"
                        >
                            star
                        </i>
                    </div>
                    Discount {maxDiscount}%
                </div>
            )}
        </div>
    )
}
