import React from 'react'

/**
 * Generic component to create a modal.
 *
 * Useful to transform a form component in modal.
 *
 * @param {bool} isShow - If true, the modal is visible, else it's hidden.
 * @param {element} children - Elements to display as modal
 */
class Modal extends React.Component {

    static defaultProps = {
        isShow: false,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isShow) $(this.refs.modal).modal('show')
        else $(this.refs.modal).modal('hide')
    }

    render() {
        const {header, children} = this.props

        return (
            <div className="ui modal" ref="modal">
                <i className="close icon" />
                <div className="header">{header}</div>
                <div className="content">{children}</div>
            </div>
        )
    }
}

Modal.propTypes = {
    header: React.PropTypes.string.isRequired,
    isShow: React.PropTypes.bool,
    children: React.PropTypes.element.isRequired,
}

export default Modal
