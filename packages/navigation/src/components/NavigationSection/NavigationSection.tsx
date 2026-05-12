import type { ReactNode } from 'react'

import type { Location } from 'history'
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom'
import type { match as Match } from 'react-router-dom'

import {
    Box,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    DropdownIcon,
    Icon,
    isIconName,
    OverflowTooltip,
    Text,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './NavigationSection.less'

type BaseSectionProps = {
    label: string | ReactNode
    leadingSlot?: IconName | ReactNode
    id?: string
    canduId?: string | null
}

type CollapsibleSectionProps = BaseSectionProps & {
    children: ReactNode
    to?: never
    actionsSlot?: ReactNode
    trailingSlot?: IconName | ReactNode
    isDisabled?: boolean
    defaultExpanded?: boolean
    onExpandedChange?: (isExpanded: boolean) => void
}

type LinkSectionProps = BaseSectionProps & {
    to: string
    children?: never
    exact?: boolean
    isActive?: (match: Match | null, location: Location) => boolean
}

export type NavigationSectionProps = CollapsibleSectionProps | LinkSectionProps

function isLink(props: NavigationSectionProps): props is LinkSectionProps {
    return 'to' in props && typeof props.to === 'string'
}

export function NavigationSection(props: NavigationSectionProps) {
    const location = useLocation()
    const match = useRouteMatch({
        path: isLink(props) ? props.to : undefined,
        exact: isLink(props) ? props.exact : undefined,
    })

    if (isLink(props)) {
        const {
            label,
            leadingSlot,
            to,
            exact,
            isActive: isActiveProp,
            canduId,
        } = props
        const isActive = isActiveProp ? isActiveProp(match, location) : !!match
        return (
            <NavLink
                to={to}
                exact={exact}
                isActive={isActiveProp}
                className={css.link}
                {...(canduId ? { 'data-candu-id': canduId } : {})}
            >
                <Box
                    alignItems="center"
                    width="100%"
                    gap="xs"
                    paddingLeft="xs"
                    paddingRight="xxxs"
                    paddingBottom="xxxs"
                    paddingTop="xxxs"
                >
                    {leadingSlot && isIconName(leadingSlot) ? (
                        <Icon name={leadingSlot} size="sm" />
                    ) : (
                        leadingSlot
                    )}
                    <OverflowTooltip placement="right">
                        <Text
                            variant={isActive ? 'bold' : 'medium'}
                            overflow="ellipsis"
                        >
                            {label}
                        </Text>
                    </OverflowTooltip>
                </Box>
            </NavLink>
        )
    }

    const {
        id,
        canduId,
        label,
        leadingSlot,
        children,
        actionsSlot,
        trailingSlot,
        isDisabled,
        defaultExpanded,
        onExpandedChange,
    } = props

    return (
        <Disclosure
            isDisabled={isDisabled}
            id={id}
            defaultExpanded={defaultExpanded}
            onExpandedChange={onExpandedChange}
            {...(canduId ? { 'data-candu-id': canduId } : {})}
        >
            <DisclosureHeader
                title={
                    <Box
                        alignItems="center"
                        width="100%"
                        justifyContent="space-between"
                        gap="xs"
                        className={css.header}
                    >
                        <Box
                            paddingBottom="xxxs"
                            paddingTop="xxxs"
                            width="100%"
                            className={css.title}
                        >
                            <OverflowTooltip placement="right">
                                <Text variant="medium" overflow="ellipsis">
                                    {label}
                                </Text>
                            </OverflowTooltip>
                        </Box>
                        <Box className={css.actionsSlot}>{actionsSlot}</Box>
                    </Box>
                }
                paddingLeft="xs"
                paddingRight="xxxs"
                leadingSlot={leadingSlot}
                trailingSlot={({ isExpanded }) => (
                    <Box alignItems="center" gap="xs">
                        <DropdownIcon isOpen={isExpanded} />
                        {trailingSlot && isIconName(trailingSlot) ? (
                            <Icon name={trailingSlot} size="sm" />
                        ) : (
                            trailingSlot
                        )}
                    </Box>
                )}
            />
            <DisclosurePanel
                flexDirection="column"
                paddingLeft="lg"
                paddingTop="xxxxs"
                gap="xxxxs"
            >
                {children}
            </DisclosurePanel>
        </Disclosure>
    )
}
