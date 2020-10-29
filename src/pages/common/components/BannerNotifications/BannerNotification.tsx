import React, {Component, ReactNode} from 'react'
import classNames from 'classnames'

import {NotificationStatus} from '../../../../state/notifications/types'

type Props = {
    id: string | number
    status: NotificationStatus
    onClick?: () => void
    message: string | ReactNode
    dismissible: boolean
    closable: boolean
    allowHTML: boolean
    hide: (value: string | number) => void
}

class BannerNotification extends Component<Props> {
    static defaultProps = {
        allowHTML: true,
        closable: false,
        dismissible: true,
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

    close = () => {
        const {hide, id} = this.props
        hide(id)
    }

    render() {
        const {status, message, allowHTML, closable} = this.props
        const classnames = classNames(
            'banner-notification',
            `banner-notification--${status}`,
            {
                'banner-notification--active': true,
            }
        )

        return (
            <div className={classnames}>
                {allowHTML ? (
                    <span
                        onClick={this._onClick}
                        className="banner-notification-message"
                        dangerouslySetInnerHTML={{__html: message as string}}
                    ></span>
                ) : (
                    <span
                        onClick={this._onClick}
                        className="banner-notification-message"
                    >
                        {message}
                    </span>
                )}
                {closable && (
                    <span className="banner-notification-message__close">
                        <span>
                            <i className="material-icons" onClick={this.close}>
                                close
                            </i>
                        </span>
                    </span>
                )}
            </div>
        )
    }
}

export default BannerNotification
