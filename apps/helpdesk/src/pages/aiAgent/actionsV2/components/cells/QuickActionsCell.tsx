import { useState } from 'react'

import { useHistory } from 'react-router-dom'
import { useDeleteAction } from 'pages/aiAgent/actions/hooks/useDeleteAction'
import { useGuidanceReferenceContext } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { Box, Button, Menu, MenuItem, MenuSize } from '@gorgias/axiom'

type Props = {
    action: StoreWorkflowsConfiguration
    shopName: string
    shopType: 'shopify'
}

const QuickActionsCell = ({ action, shopName, shopType }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const { canBeDeleted } = useGuidanceReferenceContext()
    const { mutate: deleteAction, isLoading: isDeleting } = useDeleteAction(
        action.name,
        shopName,
        shopType,
    )

    const handleViewLogs = () => {
        setIsOpen(false)
        history.push(routes.actionEvents(action.id))
    }

    const handleDelete = () => {
        setIsOpen(false)
        if (canBeDeleted(action.id) && !isDeleting) {
            void deleteAction([{ internal_id: action.internal_id }])
        }
    }

    return (
        <Box
            display="inline-flex"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <Menu
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                size={MenuSize.Sm}
                trigger={
                    <Button
                        variant="tertiary"
                        size="sm"
                        as="button"
                        aria-label={`Row actions for ${action.name}`}
                        icon="dots-meatballs-horizontal"
                    />
                }
            >
                <>
                    <MenuItem
                        id="usage"
                        label="View action usage (coming soon)"
                        leadingSlot="chart-line"
                        isDisabled
                    />
                    <MenuItem
                        id="logs"
                        label="View event logs"
                        leadingSlot="file-document"
                        onAction={handleViewLogs}
                    />
                    <MenuItem
                        id="delete"
                        label="Delete"
                        leadingSlot="trash-empty"
                        onAction={handleDelete}
                        isDisabled={!canBeDeleted(action.id) || isDeleting}
                    />
                </>
            </Menu>
        </Box>
    )
}

export { QuickActionsCell }
