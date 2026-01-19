import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
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
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    const theme = useTheme()

    return (
        <div
            className={classNames(css[theme.resolvedName], css.container, {
                [css.highlighted]: isHighlighted,
                [css.legacy]: !applyCallBarRestyling,
            })}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
