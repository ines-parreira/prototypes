import { forwardRef } from 'react'
import type { ReactNode } from 'react'

import type { Location } from 'history'
import { NavLink } from 'react-router-dom'
import type { match as Match } from 'react-router-dom'

import { Box, Icon, isIconName, OverflowTooltip, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './NavigationSection.less'

export type NavigationSectionItemProps = {
    canduId?: string | null
    label: string | ReactNode
    leadingSlot?: IconName | ReactNode
    trailingSlot?: IconName | ReactNode
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
        isActive,
        onClick,
    } = props

    return (
        <NavLink
            innerRef={ref}
            id={id}
            to={to}
            exact={exact}
            isActive={isActive}
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
                        <Text overflow="ellipsis">{label}</Text>
                    </OverflowTooltip>
                </Box>
                {trailingSlot && isIconName(trailingSlot) ? (
                    <Icon name={trailingSlot} size="sm" />
                ) : (
                    trailingSlot
                )}
            </Box>
        </NavLink>
    )
})
