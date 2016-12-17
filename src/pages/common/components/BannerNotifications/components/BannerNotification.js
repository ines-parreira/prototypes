import React, {PropTypes, Component} from 'react'
import classNames from 'classnames'

class BannerNotification extends Component {
    static propTypes = {
        uid: PropTypes.number.isRequired,
        level: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
        onClick: PropTypes.func,
        message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        dismissible: PropTypes.bool.isRequired,
        allowHtml: PropTypes.bool.isRequired,
        hide: PropTypes.func.isRequired
    }

    static defaultProps = {
        allowHtml: true,
        dismissible: true
    }

    state = {
        show: false,
        isActive: false
    }

    componentDidMount() {
        this._show()
    }

    // play "leave" css animation
    componentWillLeave(callback) {
        this.setState({isActive: false})

        setTimeout(() => {
            callback()
        }, 1000)
    }

    _show = () => {
        this.setState({show: true})
        // play "enter" css animation
        setTimeout(() => {
            this.setState({isActive: true})
        }, 1000)
    }

    _onClick = () => {
        const {uid, onClick, dismissible, hide} = this.props

        if (typeof onClick === 'function') {
            onClick()
        }

        if (dismissible) {
            hide(uid)
        }
    }

    render() {
        const {level, message, allowHtml} = this.props
        const {show, isActive} = this.state

        if (!show) {
            return null
        }

        const classnames = classNames(
            'banner-notification',
            `banner-notification--${level}`, {
                'banner-notification--active': isActive
            })

        return (
            <div className={classnames}>
                {allowHtml ?
                    <span
                        onClick={this._onClick}
                        className="banner-notification-message"
                        dangerouslySetInnerHTML={{__html: message}}
                    >
                    </span> :
                    <span
                        onClick={this._onClick}
                        className="banner-notification-message"
                    >
                        {message}
                    </span>
                }
            </div>
        )
    }
}

export default BannerNotification
