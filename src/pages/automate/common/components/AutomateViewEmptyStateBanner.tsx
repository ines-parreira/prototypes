import React, {ReactNode} from 'react'

import css from './AutomateViewEmptyStateBanner.less'

type Props = {
    title: string
    description: string
    image: string
    badge?: ReactNode
    action?: ReactNode
    canduId?: string
}

const AutomateViewEmptyStateBanner = ({
    title,
    description,
    image,
    badge,
    action,
    canduId,
}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.content}>
                <div data-candu-id={canduId} className={css.texts}>
                    {badge}
                    <div className={css.title}>{title}</div>
                    <div className={css.description}>{description}</div>
                </div>
                {action}
            </div>
            <div className={css.imageContainer}>
                <img className={css.image} src={image} alt={title} />
            </div>
        </div>
    )
}

export default AutomateViewEmptyStateBanner
