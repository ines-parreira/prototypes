import type { ForwardedRef } from 'react'
import React, { forwardRef } from 'react'

import classnames from 'classnames'

import type { BaseEdgeButtonProps } from './BaseEdgeButton'
import { DefaultExportBaseEdgeButton as BaseEdgeButton } from './BaseEdgeButton'

import css from './EdgeIconButton.less'

type Props = {
    icon: string
} & Omit<BaseEdgeButtonProps, 'children'>

const EdgeIconButton = (
    { icon, ...props }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    return (
        <BaseEdgeButton ref={ref} {...props}>
            <i className={classnames('material-icons', css.icon)}>{icon}</i>
        </BaseEdgeButton>
    )
}

const DefaultExportEdgeIconButton = forwardRef<HTMLDivElement, Props>(
    EdgeIconButton,
)

export { DefaultExportEdgeIconButton }
