import React, {PropsWithChildren} from 'react'

import css from './Section.less'

type ISectionProps = {
    icon: string
    title: string
}

export const Section: React.FC<PropsWithChildren<ISectionProps>> = ({
    icon,
    title,
    children,
}) => {
    return (
        <div>
            <div className={css.title}>
                <i className="material-icons">{icon}</i>
                {title}
            </div>
            <div className={css.card}>{children}</div>
        </div>
    )
}
