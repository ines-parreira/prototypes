// @flow
import React, {type Node} from 'react'
import classnames from 'classnames'

import css from './Foldable.less'

type Props = {
    children: Node,
    label: Object,
}

type State = {
    isOpen: boolean,
}

export default class Foldable extends React.Component<Props, State> {
    state = {
        isOpen: true,
    }

    _toggle = () => {
        this.setState({isOpen: !this.state.isOpen})
    }

    render() {
        const {children, label} = this.props
        const {isOpen} = this.state

        const icon = isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_right'

        return (
            <div className={classnames(css.container, {[css.closed]: !isOpen})}>
                <div
                    className={classnames(css['icon-wrapper'], {
                        [css.closed]: !isOpen,
                    })}
                    onClick={this._toggle}
                >
                    <i className="material-icons">{icon}</i>
                </div>
                {label}
                {isOpen ? (
                    <div>{children}</div>
                ) : (
                    <div className={css['dots-wrapper']} onClick={this._toggle}>
                        {/* black circle characters */}
                        &bull;&bull;&bull;
                    </div>
                )}
            </div>
        )
    }
}
