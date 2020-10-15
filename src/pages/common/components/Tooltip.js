// @flow
import React from 'react'
import {UncontrolledTooltip} from 'reactstrap'

import type {Node} from 'react'

import {isTouchDevice} from '../utils/mobile'

type Props = {
    children: Node,
    delay?: number | {show: number, hide: number},
    disabled?: boolean,
}

export default class Tooltip extends React.Component<Props> {
    static defaultProps = {
        // fix tap-twice on buttons with tooltips bug, on iOS
        delay: isTouchDevice() ? 200 : 0,
    }

    render() {
        const {children, ...rest} = this.props

        const extraProps = {}
        if (this.props.disabled) {
            extraProps.isOpen = false
        }

        return (
            <UncontrolledTooltip {...rest} {...extraProps}>
                {children}
            </UncontrolledTooltip>
        )
    }
}
