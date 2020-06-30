import React from 'react'
import {getSizedImageUrl} from '@shopify/theme-images'

import defaultImage from '../../../../../img/presentationals/shopify-product-default-image.png'

import css from './Result.less'

export type Props = {
    image: ?{
        src: string,
        alt: string,
    },
    title: string,
    subtitle: ?string,
}

export default class Result extends React.PureComponent<Props> {
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
            </div>
        )
    }
}
