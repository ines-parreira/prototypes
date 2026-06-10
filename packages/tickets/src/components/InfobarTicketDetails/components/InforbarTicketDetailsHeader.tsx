import type { ReactNode } from 'react'

import { Box, Heading, Icon } from '@gorgias/axiom'

import { SectionToggleButton } from '../../SectionToggleButton'
import { InfobarTicketDetailsHeaderContainer } from './InfobarTicketDetailsHeaderContainer'

type InfobarTicketDetailsHeaderProps = {
    ticketSummaryIcon: ReactNode
    isExpanded?: boolean
    onToggle?: () => void
}

export function InfobarTicketDetailsHeader({
    ticketSummaryIcon,
    isExpanded,
    onToggle,
}: InfobarTicketDetailsHeaderProps) {
    const showToggle = onToggle !== undefined && isExpanded !== undefined

    return (
        <InfobarTicketDetailsHeaderContainer
            onClick={showToggle ? onToggle : undefined}
        >
            <Box flexDirection="row" alignItems="center" gap="xxxs">
                {showToggle && <Icon name="tag" size="md" />}
                <Heading size="sm">Ticket details</Heading>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="xxs">
                {ticketSummaryIcon && (
                    <span
                        onClick={(e) => e.stopPropagation()}
                        role="presentation"
                    >
                        {ticketSummaryIcon}
                    </span>
                )}
                {showToggle && (
                    <SectionToggleButton
                        isExpanded={isExpanded}
                        onToggle={onToggle}
                        sectionLabel="Ticket details"
                    />
                )}
            </Box>
        </InfobarTicketDetailsHeaderContainer>
    )
}
