import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import {
    InfobarTicketDetailsContainer,
    InfobarTicketDetailsHeaderContainer,
    TagsMultiSelect,
    TicketInfobarTicketDetailsTagsContainer,
} from '@repo/tickets'

import { Box, Heading } from '@gorgias/axiom'
import type { TicketTag } from '@gorgias/helpdesk-queries'

import {
    InfobarLayoutContainer,
    InfobarLayoutContent,
} from 'pages/tickets/detail/layout/InfobarLayout'
import { NewTicketPageInfobarFields } from 'tickets/pages/NewTicketPage/components/NewTicketPageInfobar/NewTicketPageInfobarFields'

type NewTicketPageInfobarProps = {
    tags: TicketTag[]
    onTagsChange: (tags: TicketTag[]) => void
}

export function NewTicketPageInfobar({
    tags,
    onTagsChange,
}: NewTicketPageInfobarProps) {
    const { activeTab } = useTicketInfobarNavigation()

    return (
        <InfobarLayoutContainer>
            <InfobarLayoutContent>
                {activeTab === TicketInfobarTab.Customer && (
                    <Box flex={1} flexDirection="column" minWidth="340px">
                        <InfobarTicketDetailsContainer>
                            <InfobarTicketDetailsHeaderContainer>
                                <Heading size="sm">Ticket details</Heading>
                            </InfobarTicketDetailsHeaderContainer>
                            <TicketInfobarTicketDetailsTagsContainer>
                                <TagsMultiSelect
                                    value={tags}
                                    onChange={onTagsChange}
                                    aria-label="Ticket tags selection"
                                />
                            </TicketInfobarTicketDetailsTagsContainer>

                            <NewTicketPageInfobarFields />
                        </InfobarTicketDetailsContainer>
                    </Box>
                )}
            </InfobarLayoutContent>
        </InfobarLayoutContainer>
    )
}
