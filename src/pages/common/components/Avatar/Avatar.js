// @flow
import React from 'react'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import {userPictureUrl} from './utils'

import css from './Avatar.less'

type Props = {
    email: string,
    name: string,
    size: number,
    url: string,
    className?: string,
    google?: boolean,
}

type State = {
    imageUrl: string
}

export default class Avatar extends React.Component<Props, State> {
    static defaultProps = {
        url: '',
        email: '',
        name: '',
        size: 50,
        google: false
    }

    constructor(props: Props) {
        super()

        this.state = {
            imageUrl: props.url
        }
    }

    componentDidMount() {
        this._setImageUrl(this.props)
    }

    componentWillReceiveProps(nextProps: Props) {
        this._setImageUrl(nextProps)
    }

    _setImageUrl = _debounce((props) => {
        if (props.url) {
            return this.setState({imageUrl: props.url})
        }

        return userPictureUrl({
            email: props.email,
            size: props.size,
            google: props.google
        })
        .then((imageUrl) => this.setState({imageUrl}))
        .catch(() => this.setState({imageUrl: ''}))
    }, 500)

    _getInitials = (name: string) => {
        if (!name) {
            return ''
        }

        const splitName = name.split(' ').filter(text => text.length > 0)

        if (splitName.length > 1) {
            return `${splitName[0][0]}${splitName[1][0]}`
        } else if (splitName.length) {
            return splitName[0][0]
        }

        return ''
    }

    render() {
        const {
            name,
            size,
            className
        } = this.props

        return (
            <div
                className={classnames(css.component, className)}
                style={{
                    width: `${String(size)}px`,
                    height: `${String(size)}px`
                }}
            >
                <div
                    className={css.initials}
                    style={{
                        fontSize: `${String(size / 2.4)}px`
                    }}
                >
                    <span>
                        {this._getInitials(name)}
                    </span>
                </div>

                {
                    this.state.imageUrl &&
                    <img
                        src={this.state.imageUrl}
                        className={css.gravatar}
                    />
                }
            </div>
        )
    }
}
