import React from 'react'

import css from './BaseActionPreview.less'

type Props = {
    actionName: string
    columns?: boolean
    children: React.ReactNode
}

export const BaseActionPreview = ({
    actionName,
    children,
    columns = false,
}: Props) => {
    return (
        <div className={css.wrapper}>
            <div className={css.actionName}>{actionName}</div>
            <div
                className={
                    columns ? css.propsColumnWrapper : css.propsRowWrapper
                }
            >
                {children}
            </div>
        </div>
    )
}
