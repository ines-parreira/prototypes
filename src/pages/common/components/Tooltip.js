// @flow
import React from 'react'
import {UncontrolledTooltip} from 'reactstrap'

import {isTouchDevice} from '../utils/mobile'

import type {Node} from 'react'

type Props = {
    children: Node,
    delay?: number | {show: number, hide: number}
}

export default class Tooltip extends React.Component<Props> {
    static defaultProps = {
        // fix tap-twice on buttons with tooltips bug, on iOS
        delay: isTouchDevice() ? 200 : 0
    }

    render() {
        const {
            children,
            ...rest,
        } = this.props

        return (
            <UncontrolledTooltip {...rest}>
                {children}
            </UncontrolledTooltip>
        )
    }
}
