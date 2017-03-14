import React, {PropTypes} from 'react'
import classnames from 'classnames'

import css from '../Toolbar.less'

class Popover extends React.Component {
    static propTypes = {
        action: PropTypes.object,
        onIconClick: PropTypes.func,
        children: PropTypes.node.isRequired,
        icon: PropTypes.string.isRequired,
        isActive: PropTypes.bool.isRequired,
        isDisabled: PropTypes.bool.isRequired,
        name: PropTypes.string.isRequired,
    }

    static defaultProps = {
        isActive: false,
        isDisabled: false,
    }

    state = {
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
        const {isActive, isDisabled} = this.props

        return (
            <span className={css['popover-wrapper']}>
                <i
                    onMouseUp={this._open}
                    title={this.props.name}
                    className={classnames('icon', this.props.icon, css.button, {
                        [css.active]: isActive,
                        [css.disabled]: isDisabled,
                    })}
                />
                <div
                    onClick={this._onClick}
                    className={classnames(css.popover, {
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
