import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class BannerNotification extends Component {
    static propTypes = {
        id: PropTypes.number.isRequired,
        status: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
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
        const {id, onClick, dismissible, hide} = this.props

        if (typeof onClick === 'function') {
            onClick()
        }

        if (dismissible) {
            hide(id)
        }
    }

    render() {
        const {status, message, allowHtml} = this.props
        const classnames = classNames(
            'banner-notification',
            `banner-notification--${status}`, {
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
