import { useCallback, useState } from 'react'

import {
    AgentStatusesTable,
    CreateAgentStatusModal,
    DeleteStatusConfirmationModal,
    EditAgentStatusModal,
    useAgentStatuses,
    useCreateAgentStatus,
    useUpdateAgentStatus,
} from '@repo/agent-status'
import type {
    AgentStatusWithSystem,
    CreateAgentStatusModalProps,
    EditAgentStatusModalProps,
} from '@repo/agent-status'
import { Link } from 'react-router-dom'
import { useToggle } from '@gorgias/toolkit-react'

import { Banner, Box, Button, toast } from '@gorgias/axiom'

import { PageHeader } from 'pages/common/components/PageHeader'

import { CUSTOM_UNAVAILABILITY_STATUS_LIMIT } from '../../../../../../packages/agent-status/src/constants'

function AgentUnavailabilityStatuses() {
    const { data, isLoading, isError, refetch, hasReachedCreateLimit } =
        useAgentStatuses()

    const createMutation = useCreateAgentStatus()
    const updateMutation = useUpdateAgentStatus()

    const createModal = useToggle()
    const editModal = useToggle()
    const deleteModal = useToggle()

    const [statusToEdit, setStatusToEdit] = useState<
        AgentStatusWithSystem | undefined
    >()
    const [statusToDelete, setStatusToDelete] = useState<
        AgentStatusWithSystem | undefined
    >()

    const handleOpenEdit = useCallback(
        (status: AgentStatusWithSystem) => {
            setStatusToEdit(status)
            editModal.open()
        },
        [editModal],
    )

    const handleOpenDelete = useCallback(
        (status: AgentStatusWithSystem) => {
            setStatusToDelete(status)
            deleteModal.open()
        },
        [deleteModal],
    )

    const handleCloseEdit = useCallback(() => {
        editModal.close()
        setStatusToEdit(undefined)
    }, [editModal])

    const handleCloseDelete = useCallback(() => {
        deleteModal.close()
        setStatusToDelete(undefined)
    }, [deleteModal])

    const handleCreate = useCallback<CreateAgentStatusModalProps['onSubmit']>(
        async (data) => {
            try {
                await createMutation.mutateAsync({ data })
                toast.success('Status created successfully')
                createModal.close()
            } catch {
                toast.error('Failed to create status')
            }
        },
        [createMutation, createModal],
    )

    const handleEdit = useCallback<EditAgentStatusModalProps['onSubmit']>(
        async (data, status) => {
            try {
                await updateMutation.mutateAsync({
                    pk: status.id,
                    data,
                })
                toast.success('Status updated successfully')
                handleCloseEdit()
            } catch {
                toast.error('Failed to update status')
            }
        },
        [updateMutation, handleCloseEdit],
    )

    const isModalLoading = createMutation.isLoading || updateMutation.isLoading

    return (
        <Box flexDirection="column" flex={1} gap="sm">
            <PageHeader title="Agent unavailability">
                <Box gap="xs">
                    <Button
                        as="a"
                        href="https://docs.gorgias.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="tertiary"
                        trailingSlot="external-link"
                    >
                        Learning resources
                    </Button>
                    <Button
                        onClick={createModal.open}
                        isDisabled={hasReachedCreateLimit}
                    >
                        Create status
                    </Button>
                </Box>
            </PageHeader>
            <Box
                flexDirection="column"
                paddingLeft="lg"
                paddingRight="lg"
                gap="md"
            >
                <p>
                    Create and manage agent unavailable statuses to better track
                    team activity and improve visibility into how time is spent.
                    You can track this{' '}
                    <Link to="/app/stats/live-agents">here</Link>.
                </p>
                {hasReachedCreateLimit && (
                    <Banner
                        variant="inline"
                        intent="destructive"
                        title={`You have reached the ${CUSTOM_UNAVAILABILITY_STATUS_LIMIT} custom status limit`}
                        description="Delete existing custom statuses to add more."
                    />
                )}
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
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />
            <CreateAgentStatusModal
                isOpen={createModal.isOpen}
                onOpenChange={createModal.toggle}
                onSubmit={handleCreate}
                isLoading={isModalLoading}
            />
            {statusToEdit && (
                <EditAgentStatusModal
                    isOpen={editModal.isOpen}
                    onOpenChange={handleCloseEdit}
                    status={statusToEdit}
                    onSubmit={handleEdit}
                    isLoading={isModalLoading}
                />
            )}
            {statusToDelete && (
                <DeleteStatusConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onOpenChange={handleCloseDelete}
                    statusId={statusToDelete.id}
                    statusName={statusToDelete.name}
                />
            )}
        </Box>
    )
}

export { AgentUnavailabilityStatuses }
