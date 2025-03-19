import type { ReactNode } from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import navbarCss from 'assets/css/navbar.less'
import { TooltipDelay, type TooltipDelayValue } from 'core/ui/tooltip.utils'
import useId from 'hooks/useId'

import css from './GlobalNavigationItem.less'

export type GlobalNavigationItemTooltipTrigger = 'hover'[]

type GlobalNavigationItemProps = {
    'data-candu-id'?: string
    onClick?: () => void
    url?: string
    children?: ReactNode
    icon: string
    label: string
    isActive?: boolean
    tooltip?: ReactNode
    tooltipDelay?: TooltipDelayValue
}

export default function GlobalNavigationItem({
    onClick,
    url,
    label,
    children,
    icon,
    isActive,
    tooltip,
    tooltipDelay = TooltipDelay.Short,
    ...props
}: GlobalNavigationItemProps) {
    const id = useId()
    const scopedId = `global-navigation-item-${id}`

    if (typeof url === 'string') {
        return (
            <>
                <Link
                    {...(tooltip && {
                        id: scopedId,
                    })}
                    className={cn(css.icon, { [css.active]: !!isActive })}
                    data-candu-id={props['data-candu-id']}
                    to={url}
                    onClick={onClick}
                    aria-label={label}
                >
                    <i className="material-icons-round">{icon}</i>
                    {children}
                </Link>
                {tooltip && (
                    <GlobalNavigationItemTooltip
                        targetId={scopedId}
                        delay={tooltipDelay}
                    >
                        {tooltip}
                    </GlobalNavigationItemTooltip>
                )}
            </>
        )
    }

    return (
        <>
            <button
                {...(tooltip && {
                    id: scopedId,
                })}
                className={cn(css.icon, { [css.active]: !!isActive })}
                data-candu-id={props['data-candu-id']}
                onClick={onClick}
                aria-label={label}
            >
                <i className="material-icons-round">{icon}</i>
                {children}
            </button>
            {tooltip && (
                <GlobalNavigationItemTooltip
                    targetId={scopedId}
                    delay={tooltipDelay}
                >
                    {tooltip}
                </GlobalNavigationItemTooltip>
            )}
        </>
    )
}

type GlobalNavigationItemTooltipProps = {
    children: ReactNode
    targetId: string
    delay?: {
        show: number
        hide: number
    }
}

const tooltipDelay = {
    show: 1000,
    hide: 0,
}

function GlobalNavigationItemTooltip({
    children,
    targetId,
    delay,
}: GlobalNavigationItemTooltipProps) {
    return (
        <Tooltip
            target={targetId}
            boundariesElement="viewport"
            delay={delay ?? tooltipDelay}
            offset="0, 8"
            placement="right"
            trigger={['hover']}
        >
            <div className={navbarCss.tooltipContent}>{children}</div>
        </Tooltip>
    )
}
