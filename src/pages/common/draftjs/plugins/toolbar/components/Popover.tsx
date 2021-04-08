import React, {ReactNode, Component} from 'react'
import classnames from 'classnames'

import css from './Popover.less'

type Props = {
    trigger: ReactNode
    children: ReactNode
    isOpen: boolean
    className?: string
}

export default class Popover extends Component<Props> {
    render() {
        const {isOpen, children, trigger, className} = this.props
        return (
            <span className={css.popoverWrapper}>
                {trigger}
                <div
                    className={classnames(className, css.popover, {
                        [css.hidden]: !isOpen,
                    })}
                >
                    {isOpen && children}
                </div>
            </span>
        )
    }
}
