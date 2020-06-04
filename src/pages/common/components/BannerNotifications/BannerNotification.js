// @flow
import React, {Component, type Node} from 'react'
import classNames from 'classnames'

type Props = {
    id: string | number,
    status: 'info' | 'success' | 'warning' | 'error',
    onClick?: () => void,
    message: string | Node,
    dismissible: boolean,
    closable: boolean,
    allowHtml: boolean,
    hide: (string | number) => void
}

class BannerNotification extends Component<Props> {
    static defaultProps = {
        allowHtml: true,
        closable: false,
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

    close = () => {
        const {hide, id} = this.props
        hide(id)
    }

    render() {
        const {status, message, allowHtml, closable} = this.props
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
                { closable &&
                    <span className="banner-notification-message__close">
                        <span>
                            <i
                                className="material-icons"
                                onClick={this.close}
                            >
                                close
                            </i>
                        </span>
                    </span>
                }
            </div>
        )
    }
}

export default BannerNotification
