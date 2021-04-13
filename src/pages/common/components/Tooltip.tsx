import React, {ReactNode, Component} from 'react'
import {UncontrolledTooltip, UncontrolledTooltipProps} from 'reactstrap'

import {isTouchDevice} from '../utils/mobile.js'

type Props = {
    children: ReactNode
    delay: number | {show: number; hide: number}
    disabled?: boolean
} & Pick<UncontrolledTooltipProps, KnownKeys<UncontrolledTooltipProps>>

type ExtraProps = {
    isOpen?: boolean
}

export default class Tooltip extends Component<Props> {
    static defaultProps: Pick<Props, 'delay'> = {
        // fix tap-twice on buttons with tooltips bug, on iOS
        delay: isTouchDevice() ? 200 : 0,
    }

    render() {
        const {children, ...rest} = this.props

        const extraProps: ExtraProps = {}
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
