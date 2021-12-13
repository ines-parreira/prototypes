import React from 'react'

import imagePlaceholder from 'assets/img/icons/insert-photo.svg'

import css from './ProductCell.less'

type Props = {
    name: string
    imageUrl: string | null
}

const ProductCell = ({name, imageUrl}: Props) => (
    <div className={css.container}>
        {imageUrl ? (
            <div
                className={css['product-image']}
                style={{
                    backgroundImage: `url('${imageUrl}')`,
                }}
            />
        ) : (
            <div className={css['product-image']}>
                <img
                    src={imagePlaceholder}
                    alt="Placeholder"
                    className={css['placeholder']}
                />
            </div>
        )}

        <h5 className={css['product-name']}>{name}</h5>
    </div>
)

export default ProductCell
