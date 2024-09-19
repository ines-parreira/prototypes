import React from 'react'

import css from 'pages/convert/common/components/ConvertShopifyProductLineHeader/ConvertShopifyProductLineHeader.less'

type Props = {
    productsLength: number
    productsPerPage: number
}

export const ConvertShopifyProductLineHeader = ({
    productsLength,
    productsPerPage,
}: Props) => {
    return (
        <div className={css.header}>
            <div>Products</div>
            <div className={css.itemCount}>
                <span className={css.resultTotal}>
                    {productsLength}
                    {productsLength >= productsPerPage ? '+' : ''}
                    {' PRODUCTS'}
                </span>
            </div>
        </div>
    )
}
