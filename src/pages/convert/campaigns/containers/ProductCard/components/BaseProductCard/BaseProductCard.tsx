import React, {ReactNode} from 'react'

import css from './BaseProductCard.less'

type Props = {
    renderFeaturedImage: () => ReactNode
    children: ReactNode | ReactNode[]
}

export const BaseProductCard = ({renderFeaturedImage, children}: Props) => {
    return (
        <div className={css.wrapper}>
            {renderFeaturedImage()}
            <div className={css.container}>
                <div className={css.content}>
                    <>{children}</>
                </div>
            </div>
        </div>
    )
}
