import type { ReactNode } from 'react'

import { useId } from '@repo/hooks'
import cn from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import css from 'common/navigation/components/GlobalNavigationItem.less'
import { TooltipDelay } from 'core/ui/tooltip.utils'
import type { TooltipDelayValue } from 'core/ui/tooltip.utils'
import type { PolymorphicProps } from 'types'

export type GlobalNavigationItemTooltipTrigger = 'hover'[]

type GlobalNavigationItemProps<E extends React.ElementType> =
    PolymorphicProps<E> & {
        'data-candu-id'?: string
        icon: string
        label: string
        isActive?: boolean
        tooltip?: ReactNode
        tooltipDelay?: TooltipDelayValue
    }

export default function GlobalNavigationItem<E extends React.ElementType>({
    as,
    label,
    children,
    icon,
    isActive,
    tooltip,
    tooltipDelay = TooltipDelay.Short,
    ...props
}: GlobalNavigationItemProps<E>) {
    const Component = as || 'button'
    const id = useId()
    const scopedId = `global-navigation-item-${id}`

    return (
        <Component
            {...props}
            {...(tooltip && {
                id: scopedId,
            })}
            className={cn(css.icon, {
                [css.active]: !!isActive,
            })}
            data-candu-id={props['data-candu-id']}
            aria-label={label}
        >
            <i className="material-icons-round">{icon}</i>

            {children}
            {tooltip && (
                <GlobalNavigationItemTooltip
                    targetId={scopedId}
                    delay={tooltipDelay}
                >
                    {tooltip}
                </GlobalNavigationItemTooltip>
            )}
        </Component>
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
            delay={delay ?? tooltipDelay}
            offset="0, 8"
            placement="right"
            trigger={['hover']}
            innerProps={{
                modifiers: {
                    preventOverflow: { boundariesElement: 'viewport' },
                },
            }}
        >
            <div className={navbarCss.tooltipContent}>{children}</div>
        </Tooltip>
    )
}
