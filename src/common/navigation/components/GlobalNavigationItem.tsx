import React from 'react'
import type { ReactNode } from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import navbarCss from 'assets/css/navbar.less'
import { TooltipDelay, type TooltipDelayValue } from 'core/ui/tooltip.utils'
import useId from 'hooks/useId'

import css from './GlobalNavigationItem.less'

export type GlobalNavigationItemTooltipTrigger = ('hover' | 'focus')[]

type GlobalNavigationItemProps = {
    'data-candu-id'?: string
    onClick?: () => void
    url?: string
    children?: ReactNode
    icon: string
    isActive?: boolean
    tooltip?: ReactNode
    tooltipDelay?: TooltipDelayValue
    tooltipTrigger?: GlobalNavigationItemTooltipTrigger
}

export default function GlobalNavigationItem({
    onClick,
    url,
    children,
    icon,
    isActive,
    tooltip,
    tooltipDelay = TooltipDelay.Short,
    tooltipTrigger = ['hover', 'focus'],
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
                >
                    <i className="material-icons-round">{icon}</i>
                    {children}
                </Link>
                {tooltip && (
                    <GlobalNavigationItemTooltip
                        targetId={scopedId}
                        delay={tooltipDelay}
                        trigger={tooltipTrigger}
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
            >
                <i className="material-icons-round">{icon}</i>
                {children}
            </button>
            {tooltip && (
                <GlobalNavigationItemTooltip
                    targetId={scopedId}
                    delay={tooltipDelay}
                    trigger={tooltipTrigger}
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
    trigger?: GlobalNavigationItemTooltipTrigger
}

const tooltipDelay = {
    show: 1000,
    hide: 0,
}

function GlobalNavigationItemTooltip({
    children,
    targetId,
    delay,
    trigger,
}: GlobalNavigationItemTooltipProps) {
    return (
        <Tooltip
            // Required to force the tooltip to correctly account for changes in
            // its trigger props array. This is a reactstrap issue.
            key={`${targetId}-${trigger?.join(',')}`}
            target={targetId}
            boundariesElement="viewport"
            delay={delay ?? tooltipDelay}
            offset="0, 8"
            placement="right"
            trigger={trigger}
        >
            <div className={navbarCss.tooltipContent}>{children}</div>
        </Tooltip>
    )
}
