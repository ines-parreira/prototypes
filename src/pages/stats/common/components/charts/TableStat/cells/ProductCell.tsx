import React, {useEffect, useState} from 'react'
import axios from 'axios'

import imagePlaceholder from 'assets/img/icons/insert-photo.svg'

import css from './ProductCell.less'

type Props = {
    name: string
    imageUrl: string | null
}

const ProductCell = ({name, imageUrl}: Props) => {
    const [isImageNotFound, setIsImageNotFound] = useState(!imageUrl)

    useEffect(() => {
        const checkImageFound = async (url: string) => {
            try {
                await axios.head(url)
            } catch (err) {
                setIsImageNotFound(true)
            }
        }

        if (imageUrl) {
            void checkImageFound(imageUrl)
        }
    }, [imageUrl])

    return (
        <div className={css.container}>
            {!imageUrl || isImageNotFound ? (
                <div className={css['product-image']}>
                    <img
                        src={imagePlaceholder}
                        alt="Placeholder"
                        className={css['placeholder']}
                        data-testid="placeholder"
                    />
                </div>
            ) : (
                <div
                    className={css['product-image']}
                    style={{
                        backgroundImage: `url('${imageUrl}')`,
                    }}
                />
            )}
            <h5 className={css['product-name']}>{name}</h5>
        </div>
    )
}

export default ProductCell
