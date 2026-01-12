import {
    AgentStatusesTable,
    AgentStatusLegacyBridgeProvider,
    DeleteStatusConfirmationModal,
    useAgentStatuses,
    useDeleteCustomUserAvailabilityStatusModal,
} from '@repo/agent-status'
import { Link } from 'react-router-dom'

import { Banner, Box, Button, Icon } from '@gorgias/axiom'

import PageHeader from 'pages/common/components/PageHeader'

import { useAgentStatusLegacyBridgeFunctions } from './useAgentStatusLegacyBridgeFunctions'

function AgentUnavailabilityStatuses() {
    const { data, isLoading, isError, refetch } = useAgentStatuses()
    const bridgeFunctions = useAgentStatusLegacyBridgeFunctions()
    const { deleteModalState, openStatusDeleteModal, closeStatusDeleteModal } =
        useDeleteCustomUserAvailabilityStatusModal()

    return (
        <AgentStatusLegacyBridgeProvider {...bridgeFunctions}>
            <Box flexDirection="column" flex={1} gap="sm">
                <PageHeader title="Agent unavailability">
                    <Box gap="xs">
                        <Button
                            onClick={() => {}}
                            variant="tertiary"
                            trailingSlot={<Icon name="external-link" />}
                        >
                            Learning resources
                        </Button>
                        <Button onClick={() => {}}>Create status</Button>
                    </Box>
                </PageHeader>
                <Box
                    flexDirection="column"
                    paddingLeft="lg"
                    paddingRight="lg"
                    gap="md"
                >
                    <p>
                        Create and manage agent unavailable statuses to better
                        track team activity and improve visibility into how time
                        is spent. You can track this{' '}
                        <Link to="/app/stats/live-agents">here</Link>.
                    </p>
                    {isError && (
                        <Banner
                            variant="inline"
                            intent="destructive"
                            title="Failed to load custom statuses"
                            description="Something went wrong when fetching custom statuses. System statuses are still available below."
                        >
                            <Button
                                onClick={() => refetch()}
                                variant="secondary"
                                size="sm"
                            >
                                Retry
                            </Button>
                        </Banner>
                    )}
                </Box>
                <AgentStatusesTable
                    data={data}
                    isLoading={isLoading}
                    onEdit={() => {}}
                    onDelete={openStatusDeleteModal}
                />
            </Box>

            {deleteModalState.statusId && (
                <DeleteStatusConfirmationModal
                    isOpen={deleteModalState.isOpen}
                    onOpenChange={closeStatusDeleteModal}
                    statusId={deleteModalState.statusId}
                    statusName={deleteModalState.statusName || 'this status'}
                />
            )}
        </AgentStatusLegacyBridgeProvider>
    )
}

export default AgentUnavailabilityStatuses
