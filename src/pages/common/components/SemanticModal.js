import React, {Component, PropTypes} from 'react'
import classNames from 'classnames'

export default class SemanticModal extends Component {
    static propTypes = {
        transition: PropTypes.string,
        isOpen: PropTypes.bool,
        children: PropTypes.node,
        onClose: PropTypes.func,
        inverted: PropTypes.bool,
        basic: PropTypes.bool,
        dismissible: PropTypes.bool
    }

    static defaultProps = {
        transition: 'scale',
        isOpen: true,
        inverted: false,
        basic: false,
        dismissible: true
    }

    state = {}

    componentDidMount() {
        if (this.props.isOpen) {
            this._show()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this._show()
        } else if (this.props.isOpen && !nextProps.isOpen) {
            this._hide()
        }
    }

    componentDidUpdate() {
        // delay jquery call to have DOM up-to-date
        setTimeout(() => {
            $(this.refs.modal).modal('refresh')
        }, 1)
    }

    _onClose = () => {
        if (typeof this.props.onClose === 'function') {
            this.props.onClose()
        }
        this.setState({show: false})
    }

    _show = () => {
        this.setState({show: true})

        // delay jquery call to have DOM up-to-date
        setTimeout(() => {
            $(this.refs.modal).modal({
                transition: this.props.transition,
                detachable: false,
                closable: this.props.dismissible,
                onHidden: this._onClose
            }).modal('show')

            setTimeout(() => {
                $(this.refs.modal).modal('refresh')
            }, 1000)
        }, 1)
    }

    _hide = () => {
        // delay jquery call to have DOM up-to-date
        setTimeout(() => {
            $(this.refs.modal).modal('hide')
        }, 1)
    }

    render() {
        const {inverted, basic, children} = this.props
        const {show} = this.state
        const classnames = classNames('ui', 'modal', {
            basic,
            inverted
        })

        if (!show) {
            return null
        }

        return (
            <div ref="modal" className={classnames}>
                {children}
            </div>
        )
    }
}
