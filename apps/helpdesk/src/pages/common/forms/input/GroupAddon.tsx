import type { HTMLProps } from 'react'
import React, { useContext } from 'react'

import { reportError } from '@repo/logging'
import classnames from 'classnames'

import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import { InputGroupContext } from 'pages/common/forms/input/InputGroup'

import css from './GroupAddon.less'

type Props = {
    isDisabled?: boolean
} & HTMLProps<HTMLSpanElement>

function GroupAddon({ className, isDisabled = false, ...props }: Props) {
    const groupContext = useContext(GroupContext)
    const appendPosition = useContext(GroupPositionContext) || ''
    const isNotInsideInputGroup = !useContext(InputGroupContext)

    if (isNotInsideInputGroup) {
        reportError(new Error('GroupAddon must be inside an InputGroup'))
    }

    return (
        <span
            className={classnames(
                className,
                css.groupAddon,
                css[appendPosition],
                {
                    [css.isDisabled]: groupContext?.isDisabled || isDisabled,
                },
            )}
            {...props}
        />
    )
}

export default GroupAddon
