import {
    Box,
    Button,
    DropdownIcon,
    Heading,
    Menu,
    MenuItem,
    MenuSection,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { useGetView } from '@gorgias/helpdesk-queries'

import { useCreateTicketDraft } from './useCreateTicketDraft'

type ViewHeaderProps = {
    viewId: number
    onExpand?: () => void
}

export function ViewHeader({ viewId, onExpand }: ViewHeaderProps) {
    const { data: viewResponse } = useGetView(viewId)
    const viewName = viewResponse?.data?.name
    const { hasDraft, onCreateTicket, onResumeDraft, onDiscardDraft } =
        useCreateTicketDraft()

    const createTicketButton = hasDraft ? (
        <Menu
            placement="bottom right"
            trigger={({ isOpen }) => (
                <Button
                    variant="primary"
                    trailingSlot={<DropdownIcon isOpen={isOpen} />}
                >
                    Create ticket
                </Button>
            )}
        >
            <MenuSection id="create-ticket-options">
                <MenuItem
                    id="resume"
                    label="Resume draft"
                    onAction={onResumeDraft}
                />
                <MenuItem
                    id="discard"
                    label="Discard and create new ticket"
                    onAction={onDiscardDraft}
                />
            </MenuSection>
        </Menu>
    ) : (
        <Button variant="primary" onClick={onCreateTicket}>
            Create ticket
        </Button>
    )

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap="xs"
            p="lg"
        >
            <Box flexDirection="row" alignItems="center" gap="xs">
                <Tooltip
                    trigger={
                        <Button
                            variant="secondary"
                            size="sm"
                            icon="system-bar-left"
                            aria-label="Show ticket panel"
                            onClick={onExpand}
                        />
                    }
                >
                    <TooltipContent title="Show ticket panel" />
                </Tooltip>
                <Heading size="xl">{viewName}</Heading>
            </Box>
            {createTicketButton}
        </Box>
    )
}
