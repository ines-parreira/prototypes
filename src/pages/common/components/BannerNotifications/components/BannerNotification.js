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
        const classnames = classNames(
            'banner-notification',
            `banner-notification--${level}`, {
                'banner-notification--active': true
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
