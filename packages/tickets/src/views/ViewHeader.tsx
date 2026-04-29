import {
    Button,
    DropdownIcon,
    Menu,
    MenuItem,
    MenuSection,
    PanelHeader,
    Tooltip,
    TooltipContent,
    useStickyScroll,
} from '@gorgias/axiom'
import { useGetView } from '@gorgias/helpdesk-queries'

import { getViewDisplayName } from '../utils/views'
import { useCreateTicketDraft } from './useCreateTicketDraft'

type ViewHeaderProps = {
    viewId: number
    onExpand?: () => void
    onEditView?: () => void
    titleOverride?: string
    hideCreateTicket?: boolean
    isDraftView?: boolean
    isSearchMode?: boolean
    isSettingsExpanded?: boolean
}

export function ViewHeader({
    viewId,
    onExpand,
    onEditView,
    titleOverride,
    hideCreateTicket = false,
    isDraftView = false,
    isSearchMode = false,
    isSettingsExpanded = false,
}: ViewHeaderProps) {
    const { data: viewResponse } = useGetView(viewId, {
        query: {
            enabled: !titleOverride && !isDraftView,
        },
    })
    const { scroll } = useStickyScroll()

    const handleEditView = () => {
        if (!isSettingsExpanded) scroll.toTop()
        onEditView?.()
    }
    const viewName =
        titleOverride ??
        (viewResponse?.data ? getViewDisplayName(viewResponse.data) : '')
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

    const showExpandButton = !isDraftView && !isSearchMode
    const showEditViewButton = !isDraftView && !isSearchMode
    const showCreateTicketButton = !hideCreateTicket && !isSearchMode

    const leadingSlot = showExpandButton ? (
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
    ) : undefined

    const trailingSlot =
        showEditViewButton || showCreateTicketButton ? (
            <>
                {showEditViewButton && (
                    <Tooltip
                        trigger={
                            <Button
                                variant={
                                    isSettingsExpanded
                                        ? 'secondary'
                                        : 'tertiary'
                                }
                                size="sm"
                                icon="slider-filter"
                                aria-label="Edit view"
                                aria-expanded={isSettingsExpanded}
                                onClick={handleEditView}
                            />
                        }
                    >
                        <TooltipContent title="Edit view" />
                    </Tooltip>
                )}
                {showCreateTicketButton && createTicketButton}
            </>
        ) : undefined

    return (
        <PanelHeader
            title={viewName}
            leadingSlot={leadingSlot}
            trailingSlot={trailingSlot}
        />
    )
}
