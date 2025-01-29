import {Tooltip} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React from 'react'
import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import useId from 'hooks/useId'

import css from './GlobalNavigationItem.less'

export type GlobalNavigationItemTooltipTrigger = ('hover' | 'focus')[]

type CommonGlobalNavigationItemProps = {
    children?: ReactNode
    icon: string
    isActive?: boolean
    tooltip?: ReactNode
    tooltipDelay?: {
        show: number
        hide: number
    }
    tooltipTrigger?: GlobalNavigationItemTooltipTrigger
}

type GlobalNavigationItemLinkProps = CommonGlobalNavigationItemProps & {
    url: string
}

type GlobalNavigationItemButtonProps = CommonGlobalNavigationItemProps & {
    onClick: () => void
}

type GlobalNavigationItemProps =
    | GlobalNavigationItemLinkProps
    | GlobalNavigationItemButtonProps

export default function GlobalNavigationItem({
    children,
    icon,
    isActive,
    tooltip,
    tooltipDelay,
    tooltipTrigger = ['hover', 'focus'],
    ...props
}: GlobalNavigationItemProps) {
    const id = useId()
    const scopedId = `global-navigation-item-${id}`

    if ('url' in props) {
        const {url} = props
        return (
            <>
                <Link
                    {...(tooltip && {
                        id: scopedId,
                    })}
                    className={cn(css.icon, {[css.active]: !!isActive})}
                    to={url}
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

    const {onClick} = props

    return (
        <>
            <button
                {...(tooltip && {
                    id: scopedId,
                })}
                className={cn(css.icon, {[css.active]: !!isActive})}
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
