import React, { CSSProperties, useCallback, useEffect, useState } from 'react'

import classnames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { getAvatar, getAvatarFromCache, getInitials } from './utils'

import css from './Avatar.less'

type Props = {
    badgeBorderColor?: string
    badgeClassName?: string
    badgeColor?: string
    className?: string
    email?: string
    isAIAgent?: boolean
    name?: string | null
    shape?: 'square' | 'round'
    showFirstInitialOnly?: boolean
    size?: number
    style?: CSSProperties
    tooltipText?: string
    url?: string | null
    withTooltip?: boolean
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Avatar />` from @gorgias/axiom instead.
 * @date 2025-04-08
 * @type ui-kit-migration
 */
export default function Avatar({
    badgeBorderColor,
    badgeClassName,
    badgeColor,
    className,
    email = '',
    isAIAgent = false,
    name = '',
    shape = 'square',
    showFirstInitialOnly = false,
    size = 50,
    style = {},
    tooltipText,
    url,
    withTooltip = false,
}: Props) {
    const getImageUrl = useCallback(
        () => url || getAvatarFromCache(email, size),
        [email, size, url],
    )

    const [imageUrl, setImageUrl] = useState(getImageUrl())

    useEffect(() => {
        if (typeof url !== 'undefined') {
            setImageUrl(getImageUrl())
            return
        }

        if (email) {
            void getAvatar({
                email,
                size,
            }).then((imageUrl: Maybe<string>) => {
                setImageUrl(imageUrl)
            })
        }
    }, [email, getImageUrl, size, url])

    return isAIAgent ? (
        <div
            className={classnames(
                css.component,
                css.aiAgent,
                css[shape],
                className,
            )}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                ...style,
            }}
        >
            <i className={classnames('material-icons', css.aiAgentIcon)}>
                auto_awesome
            </i>
        </div>
    ) : (
        <div
            className={classnames(
                css.component,
                {
                    [css.hasImage]: !!imageUrl,
                },
                css[shape],
                className,
            )}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                ...style,
            }}
        >
            <div
                className={css.initials}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    fontSize: `${size / 2.4}px`,
                }}
            >
                <span style={{ lineHeight: `${+size + 2}px` }}>
                    {getInitials(name, showFirstInitialOnly)}
                </span>
            </div>

            {imageUrl && (
                <img
                    loading="lazy"
                    alt="avatar"
                    src={imageUrl}
                    className={css.gravatar}
                    {...(size && {
                        style: {
                            width: `${size}px`,
                            height: `${size}px`,
                        },
                    })}
                />
            )}
            {badgeColor && (
                <>
                    <div
                        {...(withTooltip && { id: 'tooltip' })}
                        className={classnames(css.badge, badgeClassName)}
                        style={{
                            backgroundColor: badgeColor,
                            ...(badgeBorderColor && {
                                borderColor: badgeBorderColor,
                            }),
                        }}
                    />
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
