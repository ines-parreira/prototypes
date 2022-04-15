import React, {memo} from 'react'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import css from './ProductCardAttachment.less'

export type ProductAttachment = {
    content_type: string
    name: string
    size: number
    url: string
    extra: {
        price: number
        variant_name: string
        product_link: string
        currency: string
    }
}

interface Props {
    attachment: ProductAttachment
}

const ProductCardAttachment: React.FC<Props> = ({attachment}: Props) => {
    return (
        <a
            className={css.container}
            href={attachment.extra.product_link}
            rel="noreferrer"
            target="_blank"
            role="button"
        >
            {attachment.url !== undefined && (
                <div className={css.imageWrapper}>
                    <img
                        className={css.image}
                        src={attachment.url}
                        alt={attachment.name}
                    />
                </div>
            )}

            <div className={css.information}>
                <div className={css.name}>{attachment.name}</div>

                {attachment.extra.variant_name && (
                    <div className={css.variant}>
                        {attachment.extra.variant_name}
                    </div>
                )}

                <div className={css.price}>
                    <MoneyAmount
                        renderIfZero
                        amount={attachment.extra.price.toString()}
                        currencyCode={attachment.extra.currency}
                    />
                </div>
            </div>
        </a>
    )
}

export default memo(ProductCardAttachment)
