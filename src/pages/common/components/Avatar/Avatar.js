// @flow
import React from 'react'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'

import type {Node} from 'react'

import {getAvatar, getAvatarFromCache} from './utils'

import css from './Avatar.less'


type Props = {
    email: string,
    name: string,
    size: number,
    url: string,
    google: boolean,
    className?: string,
    style?: Object,
    badgeColor?: string,
}

type State = {
    imageUrl: ?string,
    isCached: boolean,
}

export default class Avatar extends React.Component<Props, State> {
    component: Node

    static defaultProps = {
        url: '',
        email: '',
        name: '',
        size: 50,
        google: false,
        style: {},
    }

    constructor(props: Props) {
        super()

        this.state = this._getDefaultState(props)
    }

    componentDidMount() {
        this._setImageUrl()
    }

    componentDidUpdate(prevProps: Props) {
        if (!_isEqual(prevProps, this.props)) {
            this._setImageUrl()
        }
    }

    _container = (ref: Node) => {
        this.component = ref
    }

    _getDefaultState = (props: Props) => {
        const cached = getAvatarFromCache(props.email)
        let imageUrl = cached.url
        let isCached = cached.isCached

        if (props.url) {
            imageUrl = props.url
            isCached = !!props.url
        }

        return {
            imageUrl,
            isCached
        }
    }

    _setImageUrl = () => {
        // don't update image if hidden
        if (!this.component || !this.component.offsetParent) {
            return
        }

        if (this.state.isCached) {
            return this.setState(this._getDefaultState(this.props))
        }

        return getAvatar({
            email: this.props.email,
            size: this.props.size,
            google: this.props.google
        })
        .then((image) => this.setState({
            imageUrl: image.url,
            isCached: image.isCached
        }))
    }

    _getInitials = (name: string) => {
        if (!name) {
            return ''
        }

        const splitName = name.split(' ').filter((text) => text.length > 0)

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
            className,
            style,
            badgeColor
        } = this.props

        return (
            <div
                className={classnames(css.component, {
                    [css.hasImage]: !!this.state.imageUrl
                }, className)}
                style={{
                    width: `${String(size)}px`,
                    height: `${String(size)}px`,
                    ...style
                }}
                ref={this._container}
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
                {
                    badgeColor &&
                    <div
                        className={css.badge}
                        style={{backgroundColor: badgeColor}}
                    >
                    </div>
                }
            </div>
        )
    }
}
