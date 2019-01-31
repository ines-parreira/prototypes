//@flow
import classnames from 'classnames'
import * as React from 'react'
import css from './Popover.less'

type Props = {
    trigger: React.Node,
    children: React.Node,
    isOpen: boolean,
    className?: string
}

export default class Popover extends React.Component<Props> {
    render () {
        const { isOpen, children, trigger, className } = this.props
        return (
            <span className={css.popoverWrapper}>
                {trigger}
                <div
                    className={classnames(className, css.popover, {
                        [css.hidden]: !isOpen
                    })}
                >
                    {isOpen && children}
                </div>
            </span>
        )
    }
}
