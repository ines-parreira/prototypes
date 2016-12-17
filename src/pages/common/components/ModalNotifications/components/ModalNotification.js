import React, {PropTypes, Component} from 'react'
import SemanticModal from '../../SemanticModal'

class ModalNotification extends Component {
    static propTypes = {
        uid: PropTypes.number.isRequired,
        title: PropTypes.string,
        message: PropTypes.string.isRequired,
        buttons: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            onClick: PropTypes.func,
            color: PropTypes.string,
        })).isRequired,
        dismissible: PropTypes.bool.isRequired,
        hide: PropTypes.func.isRequired
    }

    static defaultProps = {
        dismissible: true,
        buttons: []
    }

    state = {
        isOpen: true
    }

    // play "leave" animation
    componentWillLeave(callback) {
        this.setState({isOpen: false})

        setTimeout(() => {
            callback()
        }, 1000)
    }

    _onClose = () => {
        this.props.hide(this.props.uid)
    }

    _handleClick = (onClick) => {
        if (typeof onClick === 'function') {
            onClick()
        }

        this.props.hide(this.props.uid)
    }

    render() {
        const {title, message, buttons, dismissible} = this.props

        return (
            <SemanticModal
                isOpen={this.state.isOpen}
                onClose={this._onClose}
                dismissible={dismissible}
            >
                {title ?
                    <div className="header">{title}</div> :
                    null
                }
                <div className="content">
                    <p>
                        {message}
                    </p>
                </div>
                {buttons.map((button, index) => (
                    <div key={index} className="actions">
                        <button
                            onClick={() => { this._handleClick(button.onClick) }}
                            className={`ui ${button.color} button`}
                        >
                            {button.name}
                        </button>
                    </div>
                ))}
            </SemanticModal>
        )
    }
}

export default ModalNotification
