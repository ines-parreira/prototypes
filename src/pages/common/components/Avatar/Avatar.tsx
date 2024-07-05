import React, {Component, CSSProperties} from 'react'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'
import {Tooltip} from '@gorgias/ui-kit'

import {getInitials, getAvatar, getAvatarFromCache} from './utils'
import css from './Avatar.less'

type Props = {
    email: string
    name: string | null
    size: number
    url?: string | null
    className?: string
    style: CSSProperties
    badgeColor?: string
    badgeBorderColor?: string
    withTooltip?: boolean
    tooltipText?: string
    showFirstInitialOnly?: boolean
    shape?: 'square' | 'round'
    isAIAgent?: boolean
}

type State = {
    imageUrl: Maybe<string>
}

export default class Avatar extends Component<Props, State> {
    component: Maybe<HTMLDivElement>
    isMounted: boolean

    static defaultProps: Pick<
        Props,
        'email' | 'name' | 'size' | 'style' | 'shape'
    > = {
        email: '',
        name: '',
        size: 50,
        style: {},
        shape: 'square',
    }

    constructor(props: Props) {
        super(props)

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

    _container = (ref: Maybe<HTMLDivElement>) => {
        this.component = ref
    }

    _getDefaultState = (props: Props) => {
        const imageUrl =
            props.url || getAvatarFromCache(props.email, props.size)

        return {imageUrl}
    }

    _setImageUrl = () => {
        // don't update image if hidden
        if (
            !this.component ||
            !this.component.offsetParent ||
            !this.isMounted
        ) {
            return
        }

        if (typeof this.props.url !== 'undefined') {
            this.setState(this._getDefaultState(this.props))
            return
        }

        if (this.props.email) {
            void getAvatar({
                email: this.props.email,
                size: this.props.size,
            }).then((imageUrl: Maybe<string>) => {
                // Still need to do it here in case the component is unmounted while the promise is pending
                if (this.isMounted) {
                    this.setState({imageUrl})
                }
            })
        }
    }

    render() {
        const {
            name,
            size,
            className,
            style,
            badgeColor,
            badgeBorderColor,
            withTooltip = false,
            tooltipText = '',
            showFirstInitialOnly = false,
            shape = 'square',
            isAIAgent = false,
        } = this.props

        if (isAIAgent) {
            return (
                <div
                    className={classnames(
                        css.component,
                        css.aiAgent,
                        css[shape],
                        className
                    )}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        ...style,
                    }}
                >
                    <i
                        className={classnames(
                            'material-icons',
                            css.aiAgentIcon
                        )}
                    >
                        auto_awesome
                    </i>
                </div>
            )
        }

        return (
            <div
                className={classnames(
                    css.component,
                    {
                        [css.hasImage]: !!this.state.imageUrl,
                    },
                    css[shape],
                    className
                )}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    ...style,
                }}
                ref={this._container}
            >
                <div
                    className={css.initials}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        fontSize: `${size / 2.4}px`,
                    }}
                >
                    <span style={{lineHeight: `${+size + 2}px`}}>
                        {getInitials(name, showFirstInitialOnly)}
                    </span>
                </div>

                {this.state.imageUrl && (
                    <img
                        loading="lazy"
                        alt="avatar"
                        src={this.state.imageUrl}
                        className={css.gravatar}
                    />
                )}
                {badgeColor && (
                    <>
                        <div
                            {...(withTooltip && {id: 'tooltip'})}
                            className={css.badge}
                            style={{
                                backgroundColor: badgeColor,
                                ...(badgeBorderColor && {
                                    borderColor: badgeBorderColor,
                                }),
                            }}
                        ></div>
                        {withTooltip && (
                            <Tooltip
                                target={'tooltip'}
                                placement="bottom"
                                autohide={false}
                            >
                                {tooltipText}
                            </Tooltip>
                        )}
                    </>
                )}
            </div>
        )
    }
}
