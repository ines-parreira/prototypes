import classNames from 'classnames'
import React, {
    CSSProperties,
    MouseEventHandler,
    ReactNode,
    useContext,
} from 'react'

import Button from 'pages/common/components/button/Button'
import {THEME_NAME, ThemeContext} from 'theme'

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
    const context = useContext(ThemeContext)

    return (
        <div
            className={classNames(
                css.container,
                {
                    [css.default]: context?.theme !== THEME_NAME.Dark,
                    [css.dark]: context?.theme === THEME_NAME.Dark,
                },
                className
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
