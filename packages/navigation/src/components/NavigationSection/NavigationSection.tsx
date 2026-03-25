import type { ReactNode } from 'react'

import type { Location } from 'history'
import { NavLink } from 'react-router-dom'
import type { match as Match } from 'react-router-dom'

import {
    Box,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
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
    if (isLink(props)) {
        const { label, leadingSlot, to, exact, isActive, canduId } = props
        return (
            <NavLink
                to={to}
                exact={exact}
                isActive={isActive}
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
                        <Text variant="medium" overflow="ellipsis">
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
    } = props

    return (
        <Disclosure
            isDisabled={isDisabled}
            id={id}
            {...(canduId ? { 'data-candu-id': canduId } : {})}
        >
            <DisclosureHeader
                title={
                    <Box
                        alignItems="center"
                        width="100%"
                        justifyContent="space-between"
                        gap="xs"
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
                        {actionsSlot}
                    </Box>
                }
                paddingLeft="xs"
                paddingRight="xxxs"
                leadingSlot={leadingSlot}
                trailingSlot={({ isExpanded }) => (
                    <Box alignItems="center" gap="xs">
                        <Icon
                            name={
                                isExpanded
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                            size="sm"
                            color="content-neutral-tertiary"
                        />
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
