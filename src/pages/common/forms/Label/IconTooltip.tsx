import React, {ReactNode, useContext, useMemo} from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import {InputFieldContext} from 'pages/common/forms/input/InputField'

import css from './IconTooltip.less'

type Props = {
    children: ReactNode
    className?: string
    icon?: string
}

const IconTooltip = ({children, className, icon}: Props) => {
    const {id: contextId} = useContext(InputFieldContext)
    const id = useMemo(
        () => (contextId && `${contextId}-tooltip`) || _uniqueId('tooltip-'),
        [contextId]
    )

    return (
        <div className={classnames(css.wrapper, className)}>
            <i
                id={id}
                className={classnames('material-icons-outlined', css.icon)}
            >
                {icon || 'info'}
            </i>
            <Tooltip target={id} style={{textAlign: 'left'}}>
                {children}
            </Tooltip>
        </div>
    )
}

export default IconTooltip
