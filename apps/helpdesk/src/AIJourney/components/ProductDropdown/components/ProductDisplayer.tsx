import classNames from 'classnames'

import css from './ProductDisplayer.less'

type ProductDisplayerProps = {
    title: string
    image?: string
    variantTitle?: string
    isSelected?: boolean
    onClick?: () => void
}

export const ProductDisplayer = ({
    title,
    image,
    variantTitle,
    isSelected,
    onClick,
}: ProductDisplayerProps) => {
    const productDisplayerClass = classNames(css.productDisplayer, {
        [css['productDisplayer--selected']]: isSelected,
    })
    const productCodeClass = classNames(css.productCode, {
        [css['productCode--selected']]: isSelected,
    })
    const productTitleClass = classNames(css.productTitle, {
        [css['productTitle--selected']]: isSelected,
    })
    return (
        <li className={productDisplayerClass} onClick={onClick}>
            <div className={css.productImage}>
                <img src={image} alt="product-placeholder" />
            </div>
            <div className={css.productInfo}>
                {variantTitle && (
                    <span className={productCodeClass}>{variantTitle}</span>
                )}
                <span className={productTitleClass}>{title}</span>
            </div>
        </li>
    )
}
