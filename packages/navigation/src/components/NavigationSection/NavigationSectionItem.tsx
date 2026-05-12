import { forwardRef } from 'react'
import type { ReactNode } from 'react'

import type { Location } from 'history'
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom'
import type { match as Match } from 'react-router-dom'

import { Box, Icon, isIconName, OverflowTooltip, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './NavigationSection.less'

export type NavigationSectionItemProps = {
    canduId?: string | null
    label: string | ReactNode
    leadingSlot?: IconName | ReactNode
    trailingSlot?:
        | IconName
        | ReactNode
        | ((props: { isActive: boolean }) => ReactNode)
    id?: string
    to: string
    children?: never
    exact?: boolean
    isActive?: (match: Match | null, location: Location) => boolean
    onClick?: () => void
}

export const NavigationSectionItem = forwardRef<
    HTMLAnchorElement,
    NavigationSectionItemProps
>(function NavigationSectionItem(props, ref) {
    const {
        id,
        canduId,
        label,
        leadingSlot,
        trailingSlot,
        to,
        exact,
        isActive: isActiveProp,
        onClick,
    } = props

    const location = useLocation()
    const match = useRouteMatch({ path: to, exact })
    const isActive = isActiveProp ? isActiveProp(match, location) : !!match

    return (
        <NavLink
            innerRef={ref}
            id={id}
            to={to}
            exact={exact}
            isActive={isActiveProp}
            className={css.link}
            {...(canduId ? { 'data-candu-id': canduId } : {})}
            onClick={onClick}
        >
            <Box
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                gap="xs"
                paddingLeft="xxs"
                paddingRight="xxxs"
            >
                {leadingSlot && isIconName(leadingSlot) ? (
                    <Icon name={leadingSlot} size="sm" />
                ) : (
                    leadingSlot
                )}
                <Box
                    paddingTop="xxxs"
                    paddingBottom="xxxs"
                    alignItems="center"
                    flex={1}
                    className={css.label}
                >
                    <OverflowTooltip placement="right">
                        <Text
                            overflow="ellipsis"
                            variant={isActive ? 'bold' : undefined}
                        >
                            {label}
                        </Text>
                    </OverflowTooltip>
                </Box>
                {typeof trailingSlot === 'function' ? (
                    trailingSlot({ isActive })
                ) : trailingSlot && isIconName(trailingSlot) ? (
                    <Icon name={trailingSlot} size="sm" />
                ) : (
                    trailingSlot
                )}
            </Box>
        </NavLink>
    )
})
