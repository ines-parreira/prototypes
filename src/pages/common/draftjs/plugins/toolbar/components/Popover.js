//@flow
import React, {type Node} from 'react'
import classnames from 'classnames'

import css from '../Toolbar.less'

type Props = {
    action?: any,
    onIconClick?: () => boolean,
    children: Node,
    icon: string,
    isActive: boolean,
    isDisabled: boolean,
    name: string,
    className?: string,
}

type State = {
    isOpen: boolean
}

class Popover extends React.Component<Props, State> {
    static defaultProps = {
        isActive: false,
        isDisabled: false,
    }
    
    preventNextClose = false

    state: State = {
        isOpen: false,
    }

    componentDidMount() {
        document.addEventListener('click', this._close)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this._close)
    }

    _onClick = () => {
        this.preventNextClose = true
    }

    _open = () => {
        let stop = false

        if (this.props.isDisabled) {
            return
        }

        if (this.props.onIconClick) {
            // onIconClick return a boolean, true if the action should continue (open the popover) or false to stop
            stop = !this.props.onIconClick()
        }

        if (stop) {
            return
        }

        if (!this.state.isOpen) {
            this.preventNextClose = true
            this.setState({isOpen: true})
        }
    }

    _close = () => {
        if (!this.preventNextClose && this.state.isOpen) {
            this.setState({isOpen: false})
        }

        this.preventNextClose = false
    }

    render() {
        const {isActive, isDisabled, className} = this.props

        return (
            <span className={css['popover-wrapper']}>
                <button
                    type="button"
                    className={classnames(css.button, 'btn btn-secondary btn-transparent', {
                        [css.active]: isActive,
                        [css.disabled]: isDisabled,
                    })}
                    onMouseUp={this._open}
                    title={this.props.name}
                >
                    <i className="material-icons">
                        {this.props.icon}
                    </i>
                </button>
                <div
                    onClick={this._onClick}
                    className={classnames(className, css.popover, {
                        [css.hidden]: !this.state.isOpen,
                    })}
                >
                    {this.state.isOpen && this.props.children}
                </div>
            </span>
        )
    }
}

export default Popover
