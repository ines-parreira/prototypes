import type { ReactNode } from 'react'

import type { Location } from 'history'
import { NavLink } from 'react-router-dom'
import type { match as Match } from 'react-router-dom'

import { Box, Icon, isIconName, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './NavigationSection.less'

export type NavigationSectionItemProps = {
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

export function NavigationSectionItem(props: NavigationSectionItemProps) {
    const {
        label,
        leadingSlot,
        trailingSlot,
        to,
        exact,
        isActive,
        id,

        onClick,
    } = props

    return (
        <NavLink
            to={to}
            exact={exact}
            isActive={isActive}
            className={css.link}
            {...(id
                ? { 'data-candu-id': `navigation-section-item-${id}` }
                : {})}
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
                <Box paddingTop="xxxs" paddingBottom="xxxs">
                    <Text size="sm">{label}</Text>
                </Box>
                {trailingSlot && isIconName(trailingSlot) ? (
                    <Icon name={trailingSlot} size="sm" />
                ) : (
                    trailingSlot
                )}
            </Box>
        </NavLink>
    )
}
