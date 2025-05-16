import { CSSProperties, useRef } from 'react'

import cn from 'classnames'

import { getRGB } from 'gorgias-design-system/utils'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import css from './ToggleCard.less'

type ToggleCardProps = {
    title: string
    checked: boolean
    onChange: (value: boolean) => void
    subtitle?: string
    style?: CSSProperties
    children?: React.ReactNode
}

export const ToggleCard: React.FC<ToggleCardProps> = ({
    children,
    subtitle,
    checked,
    onChange,
    title,
    style,
}) => {
    const toggleRef = useRef<HTMLDivElement>(null)
    const displayChildren = children && checked

    return (
        <div
            className={cn(css.toggleCard, checked ? css.toggleCardActive : '')}
            style={style}
        >
            <div
                className={cn(
                    css.headerSection,
                    displayChildren ? css.headerSectionWithContent : '',
                )}
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleRef.current?.click()
                }}
            >
                <div className={css.headerSectionTextBlock}>
                    <div className={css.headerSectionTitle}>{title}</div>
                    <div className={css.headerSectionSubtitle}>{subtitle}</div>
                </div>
                <NewToggleButton
                    checked={checked}
                    onChange={onChange}
                    ref={toggleRef}
                    className={css.unshrinkable}
                    color={getRGB('--accessory-magenta-25')}
                    stopPropagation
                />
            </div>
            {displayChildren && (
                <div className={css.contentSection}>{children}</div>
            )}
        </div>
    )
}
