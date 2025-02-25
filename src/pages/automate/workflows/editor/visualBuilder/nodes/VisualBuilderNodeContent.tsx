import React from 'react'

import classnames from 'classnames'

import css from './VisualBuilderNodeContent.less'

type Props = {
    placeholder?: string
    children?: string
}

const VisualBuilderNodeContent = ({ placeholder, children }: Props) => {
    return (
        <div
            className={classnames(css.container, {
                [css.isFilled]: !!children,
            })}
        >
            {children || placeholder}
        </div>
    )
}

export default VisualBuilderNodeContent
