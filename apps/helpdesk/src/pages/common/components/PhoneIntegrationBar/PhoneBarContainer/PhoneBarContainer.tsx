import { ReactNode } from 'react'

import classNames from 'classnames'

import { useTheme } from 'core/theme'

import css from './PhoneBarContainer.less'

type Props = {
    children: ReactNode
    onClick?: () => void
    isHighlighted?: boolean
}

export default function PhoneBarContainer({
    children,
    onClick,
    isHighlighted = false,
}: Props) {
    const theme = useTheme()

    return (
        <div
            className={classNames(css[theme.resolvedName], css.container, {
                [css.highlighted]: isHighlighted,
            })}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
