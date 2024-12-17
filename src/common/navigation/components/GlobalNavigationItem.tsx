import {Tooltip} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import useId from 'hooks/useId'

import css from './GlobalNavigationItem.less'

type CommonGlobalNavigationItemProps = {
    icon: string
    isActive?: boolean
    tooltip?: ReactNode
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

export default function GlobalNavigationItem(props: GlobalNavigationItemProps) {
    const id = useId()
    const scopedId = `global-navigation-item-${id}`

    if ('url' in props) {
        const {tooltip, url, isActive, icon} = props
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
                </Link>
                {tooltip && (
                    <GlobalNavigationItemTooltip targetId={scopedId}>
                        {tooltip}
                    </GlobalNavigationItemTooltip>
                )}
            </>
        )
    }

    const {tooltip, onClick, isActive, icon} = props

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
            </button>
            {tooltip && (
                <GlobalNavigationItemTooltip targetId={scopedId}>
                    {tooltip}
                </GlobalNavigationItemTooltip>
            )}
        </>
    )
}

type GlobalNavigationItemTooltipProps = {
    children: ReactNode
    targetId: string
}

function GlobalNavigationItemTooltip({
    children,
    targetId,
}: GlobalNavigationItemTooltipProps) {
    return (
        <Tooltip
            target={targetId}
            boundariesElement="viewport"
            offset="0, 8"
            placement="right"
        >
            <div className={navbarCss.tooltipContent}>{children}</div>
        </Tooltip>
    )
}
