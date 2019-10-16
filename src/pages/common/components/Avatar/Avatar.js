// @flow
import React from 'react'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'

import {getAvatar, getAvatarFromCache} from './utils'
import css from './Avatar.less'


type Props = {
    email: string,
    name: string,
    size: number,
    url?: string,
    className?: string,
    style?: Object,
    badgeColor?: string,
}

type State = {
    imageUrl: ?string
}

export default class Avatar extends React.Component<Props, State> {
    component: ?HTMLDivElement
    isMounted: boolean

    static defaultProps = {
        url: '',
        email: '',
        name: '',
        size: 50,
        style: {},
    }

    constructor(props: Props) {
        super()

        this.state = this._getDefaultState(props)

        this.isMounted = false
    }

    componentDidMount() {
        this.isMounted = true
        this._setImageUrl()
    }

    componentDidUpdate(prevProps: Props) {
        if (!_isEqual(prevProps, this.props)) {
            this._setImageUrl()
        }
    }

    componentWillUnmount() {
        this.isMounted = false
    }

    _container = (ref: ?HTMLDivElement) => {
        this.component = ref
    }

    _getDefaultState = (props: Props) => {
        const imageUrl = props.url || getAvatarFromCache(props.email, props.size)

        return {imageUrl}
    }

    _setImageUrl = () => {
        // don't update image if hidden
        if (!this.component || !this.component.offsetParent || !this.isMounted) {
            return
        }

        if (typeof this.state.imageUrl !== 'undefined') {
            this.setState(this._getDefaultState(this.props))
            return
        }

        getAvatar({
            email: this.props.email,
            size: this.props.size
        }).then((imageUrl) => {
            // Still need to do it here in case the component is unmounted while the promise is pending
            if (this.isMounted) {
                this.setState({imageUrl})
            }
        })
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
                        width: `${String(size)}px`,
                        height: `${String(size)}px`,
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
