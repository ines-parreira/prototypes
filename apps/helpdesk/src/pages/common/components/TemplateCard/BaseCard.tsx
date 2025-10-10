import React, { CSSProperties, MouseEventHandler, ReactNode } from 'react'

import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import { THEME_NAME, useTheme } from 'core/theme'

import css from './Card.less'

type Props = {
    buttonLabel?: string
    className?: string
    description?: string
    icon?: ReactNode
    onClick?: MouseEventHandler<HTMLDivElement>
    showOnlyTitle?: boolean
    style?: CSSProperties
    tag?: ReactNode
    title: string
}

function BaseCard({
    buttonLabel,
    className,
    description,
    icon,
    onClick,
    showOnlyTitle,
    style,
    tag,
    title,
}: Props) {
    const theme = useTheme()

    return (
        <div
            className={classNames(
                css.container,
                {
                    [css.default]: theme.resolvedName !== THEME_NAME.Dark,
                    [css.dark]: theme.resolvedName === THEME_NAME.Dark,
                },
                className,
            )}
            onClick={onClick}
            style={style}
        >
            <div className={css.header}>
                <div className={css.wrapper}>
                    {icon}
                    {tag}
                </div>
                {buttonLabel && (
                    <Button size="small" intent="secondary" tabIndex={-1}>
                        {buttonLabel}
                    </Button>
                )}
            </div>

            {showOnlyTitle ? (
                <div className={css.onlyTitle}>{title}</div>
            ) : (
                <div className={css.text}>
                    <div className={css.title}>{title}</div>
                    <div className={css.description}>{description}</div>
                </div>
            )}
        </div>
    )
}

export default BaseCard
