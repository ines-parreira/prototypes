// @flow
import React from 'react'
import classnames from 'classnames'
import {getSizedImageUrl} from '@shopify/theme-images'

import defaultImage from '../../../../../img/presentationals/shopify-product-default-image.png'
import {ProductStockQuantity} from '../../components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/StockQuantity/index.ts'

import css from './Result.less'

export type Props = {
    image: ?{
        src: string,
        alt: string,
    },
    title: string,
    subtitle: ?string,
    stock: {
        tracked: boolean,
        quantity: ?number,
        totalVariants?: number,
    },
}

export default class Result extends React.PureComponent<Props> {
    _renderStock() {
        const {stock} = this.props

        if (!stock.tracked) {
            return (
                <div className={classnames(css.stock, css.grey)}>
                    Inventory not tracked
                </div>
            )
        }

        return (
            <div className={css.stock}>
                <ProductStockQuantity value={stock.quantity} /> in stock{' '}
                {stock.totalVariants && stock.totalVariants > 1
                    ? `for ${stock.totalVariants} variants`
                    : null}
            </div>
        )
    }

    render() {
        const {image, title, subtitle} = this.props
        const imageSrc = !!image
            ? getSizedImageUrl(image.src, 'small')
            : defaultImage
        const imageAlt = !!image ? image.alt : ''

        return (
            <div className={css.container}>
                <div className={css.imgContainer}>
                    <img className={css.img} src={imageSrc} alt={imageAlt} />
                </div>
                <div className={css.legend}>
                    <div className={css.title}>{title}</div>
                    {subtitle && <div className={css.subtitle}>{subtitle}</div>}
                </div>
                {this._renderStock()}
            </div>
        )
    }
}
