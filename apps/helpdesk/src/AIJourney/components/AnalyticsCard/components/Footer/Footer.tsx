import { CartAbandonedJourneyConfigurationApiDTO } from '@gorgias/convert-client'

import css from './Footer.less'

type FooterProps = {
    isDiscountEnabled?: boolean
    maxDiscount?: CartAbandonedJourneyConfigurationApiDTO['max_discount_percent']
    totalSent?: string
}

export const Footer = ({
    isDiscountEnabled,
    maxDiscount,
    totalSent,
}: FooterProps) => {
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
            <div className={css.totalSent}>
                <i className="material-icons-outlined">forward_to_inbox</i>
                Total sent {totalSent}
            </div>
        </div>
    )
}
