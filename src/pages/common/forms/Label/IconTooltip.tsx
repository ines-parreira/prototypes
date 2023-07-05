import React, {ComponentProps, ReactNode, useContext} from 'react'
import classnames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import {InputFieldContext} from 'pages/common/forms/input/InputField'
import useId from 'hooks/useId'

import css from './IconTooltip.less'

type Props = {
    children: ReactNode
    className?: string
    icon?: string
} & Pick<ComponentProps<typeof Tooltip>, 'placement'>

const IconTooltip = ({children, className, icon, placement}: Props) => {
    const {id: contextId} = useContext(InputFieldContext)
    const id = useId()
    const tooltipId = (contextId && `${contextId}-tooltip`) || 'tooltip-' + id

    return (
        <div className={classnames(css.wrapper, className)}>
            <i
                id={tooltipId}
                className={classnames('material-icons-outlined', css.icon)}
            >
                {icon || 'info'}
            </i>
            <Tooltip
                target={tooltipId}
                style={{textAlign: 'left'}}
                placement={placement}
            >
                {children}
            </Tooltip>
        </div>
    )
}

export default IconTooltip
