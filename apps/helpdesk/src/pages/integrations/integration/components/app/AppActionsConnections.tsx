import { useEffect, useMemo, useState } from 'react'

import { useHistory } from 'react-router-dom'

import type { SortDirection } from '@gorgias/axiom'
import {
    Box,
    Button,
    CheckBoxField,
    Icon,
    ListFooter,
    MultiSelect,
    MultiSelectItem,
    Popover,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tag,
    Text,
    toast,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { useListStores } from '@gorgias/helpdesk-queries'

import {
    isServiceConnectionHealthy,
    useAssignServiceConnectionStore,
    useListServiceConnectionsByAppId,
    useListServiceConnectionStores,
    useListServiceConnectionStoresByConnectionIds,
    useTrashServiceConnection,
} from 'models/integration/queries'
import type {
    ServiceConnectionApiDTO,
    StoreForServiceConnectionApiDTO,
} from 'models/integration/types/serviceConnection'

const STORE_SEARCH_THRESHOLD = 10
const MAX_VISIBLE_STORES = 3

export type Props = {
    appId: string
    connectUrl: string
}

type Store = { id: number; name: string }

export default function AppActionsConnections({ appId }: Props) {
    const { data: storesResponse } = useListStores({ limit: 100 })
    const {
        data: connections,
        isLoading,
        isError,
    } = useListServiceConnectionsByAppId(appId)
    const [connectionSortDirection, setConnectionSortDirection] =
        useState<SortDirection>('asc')

    useEffect(() => {
        if (isError) {
            toast.error('Failed to load connections. Please try again.')
        }
    }, [isError])

    const sortedConnections = useMemo(() => {
        const list = connections ?? []
        const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
        return connectionSortDirection === 'asc' ? sorted : sorted.reverse()
    }, [connections, connectionSortDirection])

    const connectionStoreQueries =
        useListServiceConnectionStoresByConnectionIds(
            sortedConnections.map((connection) => connection.id),
        )
    const areConnectionStoresLoading = connectionStoreQueries.some(
        (query) => query.isLoading,
    )

    const availableStores = useMemo<Store[]>(
        () =>
            (storesResponse?.data?.data ?? []).map(
                (store: { store_integration_id: number; name: string }) => ({
                    id: store.store_integration_id,
                    name: store.name,
                }),
            ),
        [storesResponse?.data?.data],
    )

    if (isLoading || areConnectionStoresLoading) {
        return (
            <Box flexDirection="column" gap="md" padding="lg">
                <Skeleton height="20px" />
                <Skeleton height="200px" />
            </Box>
        )
    }

    if (sortedConnections.length === 0) {
        return (
            <Box flexDirection="column" gap="md" padding="lg">
                <Text color="content-neutral-secondary">
                    No connections yet.
                </Text>
            </Box>
        )
    }

    return (
        <Box flexDirection="column" gap="md" padding="lg">
            <Text color="content-neutral-secondary">
                Link each connection to a store to run its actions in AI Agent.
            </Text>
            <Text size="sm" color="content-neutral-secondary">
                Showing {sortedConnections.length} of {sortedConnections.length}{' '}
                items
            </Text>
            <Table withBorder>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell
                            sortDirection={connectionSortDirection}
                            onSortChange={setConnectionSortDirection}
                        >
                            Connection
                        </TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Store</TableHeaderCell>
                        <TableHeaderCell hug />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedConnections.map((connection) => (
                        <ConnectionRow
                            key={connection.id}
                            appId={appId}
                            connection={connection}
                            availableStores={availableStores}
                        />
                    ))}
                </TableBody>
            </Table>
        </Box>
    )
}

type RowProps = {
    appId: string
    connection: ServiceConnectionApiDTO
    availableStores: Store[]
}

function ConnectionRow({ appId, connection, availableStores }: RowProps) {
    const history = useHistory()
    const editUrl = `/app/settings/integrations/app/${appId}/connections/${connection.id}`
    const { data: assignedStores = [] } = useListServiceConnectionStores(
        connection.id,
    )
    const { mutateAsync: assignStore, isLoading: isAssigning } =
        useAssignServiceConnectionStore()
    const { mutateAsync: trashConnection, isLoading: isTrashing } =
        useTrashServiceConnection(appId)

    const [selectedStores, setSelectedStores] = useState<Store[]>([])
    const [isStoreSelectOpen, setIsStoreSelectOpen] = useState(false)
    const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false)

    const needsStore = assignedStores.length === 0
    const healthy = isServiceConnectionHealthy(connection.status)
    const storesToRender: StoreForServiceConnectionApiDTO[] = assignedStores

    async function handleAssignStores() {
        try {
            await Promise.all(
                selectedStores.map((store) =>
                    assignStore({
                        connectionId: connection.id,
                        storeId: store.id,
                    }),
                ),
            )
            toast.success(`Stores linked to ${connection.name}.`)
            setSelectedStores([])
            setIsStoreSelectOpen(false)
        } catch {
            toast.error(`Failed to link stores to ${connection.name}.`)
        }
    }

    async function handleTrash() {
        try {
            await trashConnection({ connectionId: connection.id })
            toast.success(`Deleted ${connection.name}.`)
            setIsDeletePopoverOpen(false)
        } catch {
            toast.error(`Failed to delete ${connection.name}.`)
        }
    }

    return (
        <TableRow>
            <TableCell>
                <Box alignItems="center" gap="xs">
                    <Text variant="bold">{connection.name}</Text>
                    {needsStore && (
                        <Tooltip
                            delay={0}
                            trigger={
                                <Icon
                                    name="warning-triangle"
                                    size="sm"
                                    color="content-warning-default"
                                    alt="Store connection is needed for AI Agent to run actions."
                                />
                            }
                        >
                            <TooltipContent title="Store connection is needed for AI Agent to run actions." />
                        </Tooltip>
                    )}
                </Box>
            </TableCell>
            <TableCell>
                <Tag size="sm" color={healthy ? 'green' : 'red'}>
                    {healthy ? 'Healthy' : 'Unhealthy'}
                </Tag>
            </TableCell>
            <TableCell>
                {needsStore ? (
                    <MultiSelect
                        aria-label={`Connect store to ${connection.name}`}
                        items={availableStores}
                        selectedItems={selectedStores}
                        onSelect={setSelectedStores}
                        isOpen={isStoreSelectOpen}
                        onOpenChange={setIsStoreSelectOpen}
                        isSearchable={
                            availableStores.length >= STORE_SEARCH_THRESHOLD
                        }
                        searchPlaceholder="Search stores"
                        minWidth={240}
                        maxHeight={300}
                        footer={
                            <ListFooter justifyContent="flex-end" padding="xs">
                                <Button
                                    size="sm"
                                    isDisabled={
                                        selectedStores.length === 0 ||
                                        isAssigning
                                    }
                                    isLoading={isAssigning}
                                    onClick={handleAssignStores}
                                >
                                    Save
                                </Button>
                            </ListFooter>
                        }
                        trigger={({ ref, isOpen }) => (
                            <Button
                                ref={ref}
                                size="sm"
                                variant="secondary"
                                trailingSlot={
                                    <Icon
                                        name={
                                            isOpen
                                                ? 'arrow-chevron-up'
                                                : 'arrow-chevron-down'
                                        }
                                    />
                                }
                            >
                                Connect store
                            </Button>
                        )}
                    >
                        {(store) => (
                            <MultiSelectItem
                                key={store.id}
                                label={store.name}
                                textValue={store.name}
                                leadingSlot={({ isSelected }) => (
                                    <Box
                                        alignItems="center"
                                        gap="xs"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        <CheckBoxField value={isSelected} />
                                        <Icon name="app-shopify" />
                                    </Box>
                                )}
                            />
                        )}
                    </MultiSelect>
                ) : (
                    <AssignedStoresList
                        stores={storesToRender}
                        availableStores={availableStores}
                    />
                )}
            </TableCell>
            <TableCell hug>
                <Box alignItems="center" gap="xs">
                    <Popover
                        isOpen={isDeletePopoverOpen}
                        onOpenChange={setIsDeletePopoverOpen}
                        placement="bottom right"
                        maxWidth={500}
                        padding="md"
                        trigger={
                            <Button
                                size="sm"
                                intent="destructive"
                                variant="tertiary"
                                aria-label={`Delete ${connection.name}`}
                                icon={<Icon name="trash-empty" />}
                            />
                        }
                    >
                        <Box flexDirection="column" gap="md">
                            <Box
                                justifyContent="space-between"
                                alignItems="flex-start"
                                gap="sm"
                            >
                                <Text
                                    variant="bold"
                                    color="content-error-default"
                                >
                                    Delete connection?
                                </Text>
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    aria-label="Dismiss"
                                    icon={<Icon name="close" />}
                                    onClick={() =>
                                        setIsDeletePopoverOpen(false)
                                    }
                                />
                            </Box>
                            <Text color="content-neutral-secondary">
                                Are you sure you want to delete this connection
                                from Gorgias? This cannot be undone. All actions
                                associated with this store will be disabled.
                            </Text>
                            <Box gap="xs" justifyContent="flex-end">
                                <Button
                                    variant="tertiary"
                                    onClick={() =>
                                        setIsDeletePopoverOpen(false)
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    intent="destructive"
                                    isLoading={isTrashing}
                                    onClick={handleTrash}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Box>
                    </Popover>
                    <Button
                        size="sm"
                        variant="tertiary"
                        aria-label={`Open ${connection.name}`}
                        icon={<Icon name="arrow-chevron-right" />}
                        onClick={() => history.push(editUrl)}
                    />
                </Box>
            </TableCell>
        </TableRow>
    )
}

type AssignedStoresListProps = {
    stores: StoreForServiceConnectionApiDTO[]
    availableStores: Store[]
}

function AssignedStoresList({
    stores,
    availableStores,
}: AssignedStoresListProps) {
    const [isOverflowOpen, setIsOverflowOpen] = useState(false)

    const resolvedStores = useMemo(
        () =>
            stores.map((store) => ({
                id: store.store_id,
                name:
                    store.store_name ??
                    availableStores.find(({ id }) => id === store.store_id)
                        ?.name ??
                    `Store #${store.store_id}`,
            })),
        [stores, availableStores],
    )

    const visibleStores = resolvedStores.slice(0, MAX_VISIBLE_STORES)
    const overflowStores = resolvedStores.slice(MAX_VISIBLE_STORES)

    return (
        <Box alignItems="center" gap="xs" flexWrap="wrap">
            {visibleStores.map((store) => (
                <Tag
                    key={store.id}
                    size="sm"
                    leadingSlot={<Icon name="app-shopify" size="xs" />}
                >
                    {store.name}
                </Tag>
            ))}
            {overflowStores.length > 0 && (
                <Popover
                    isOpen={isOverflowOpen}
                    onOpenChange={setIsOverflowOpen}
                    placement="bottom left"
                    padding="sm"
                    trigger={
                        <Button
                            size="sm"
                            variant="tertiary"
                            aria-label={`Show ${overflowStores.length} more stores`}
                        >
                            +{overflowStores.length}
                        </Button>
                    }
                >
                    <Box
                        flexDirection="column"
                        gap="xs"
                        alignItems="flex-start"
                    >
                        {overflowStores.map((store) => (
                            <Tag
                                key={store.id}
                                size="sm"
                                leadingSlot={
                                    <Icon name="app-shopify" size="xs" />
                                }
                            >
                                {store.name}
                            </Tag>
                        ))}
                    </Box>
                </Popover>
            )}
        </Box>
    )
}
