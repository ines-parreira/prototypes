import React, { useState } from 'react'

import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import css from './ProductImage.less'

export const ProductImage = ({
    index,
    imageSource,
    imageAlt,
    allImagesLoaded,
    skeletonsize,
    skeletonClassname,
    productImageClassname,
}: {
    index: number
    imageSource?: string
    imageAlt?: string
    allImagesLoaded: boolean
    skeletonsize: number
    skeletonClassname: string
    productImageClassname?: string
}) => {
    const [loaded, setLoaded] = useState(false)

    if (!allImagesLoaded) {
        return (
            <div className={skeletonClassname}>
                <Skeleton height={skeletonsize} width={skeletonsize} />
            </div>
        )
    }

    if (imageSource) {
        return (
            <img
                src={imageSource}
                alt={imageAlt || `Product image ${index + 1}`}
                onLoad={() => setLoaded(true)}
                className={classnames(css.productImage, productImageClassname, {
                    [css.loaded]: loaded,
                })}
            />
        )
    }

    return (
        <div
            className={classnames(
                css.productImage,
                productImageClassname,
                css.color,
                css.loaded,
            )}
        />
    )
}
