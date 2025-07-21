import { CartAbandonedJourneyConfigurationApiDTOMaxDiscountPercent } from '@gorgias/convert-client'

import css from './Footer.less'

type FooterProps = {
    maxDiscount?: CartAbandonedJourneyConfigurationApiDTOMaxDiscountPercent
    totalSent?: string
}

export const Footer = ({ maxDiscount, totalSent }: FooterProps) => {
    return (
        <div className={css.footer}>
            {maxDiscount && (
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
                {/* TODO: format this number to avoid showing big numbers in the future
                    ex: 10 000 should be shown as 10k */}
                Total sent {totalSent}
            </div>
        </div>
    )
}
