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

import { IntegrationType } from 'models/integration/constants'
import {
    isServiceConnectionHealthy,
    useAssignServiceConnectionStore,
    useListServiceConnectionsByAppId,
    useListServiceConnectionStoresByConnectionIds,
    useTrashServiceConnection,
} from 'models/integration/queries'
import type {
    ServiceConnectionApiDTO,
    StoreForServiceConnectionApiDTO,
} from 'models/integration/types/serviceConnection'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { InstallSuccessModal } from 'pages/aiAgent/actionsV2/apps/components'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

const STORE_SEARCH_THRESHOLD = 10
const MAX_VISIBLE_STORES = 3

export type Props = {
    appId: string
    connectUrl: string
}

type Store = { id: number; name: string }

export default function AppActionsConnections({ appId }: Props) {
    const history = useHistory()
    const { data: storesResponse } = useListStores({ limit: 100 })
    const {
        data: connections,
        isLoading,
        isError,
    } = useListServiceConnectionsByAppId(appId)
    const [nameSortDirection, setNameSortDirection] =
        useState<SortDirection | null>(null)
    const [installSuccessStore, setInstallSuccessStore] = useState<{
        type: string
        shopName: string | undefined
    } | null>(null)

    const storeIntegrations = useStoreIntegrations([IntegrationType.Shopify])

    useEffect(() => {
        if (isError) {
            toast.error('Failed to load connections. Please try again.')
        }
    }, [isError])

    const sortedConnections = useMemo(() => {
        const list = connections ?? []
        if (nameSortDirection === null) {
            return [...list].sort((a, b) =>
                b.created_datetime.localeCompare(a.created_datetime),
            )
        }
        const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
        return nameSortDirection === 'asc' ? sorted : sorted.reverse()
    }, [connections, nameSortDirection])

    const connectionStoreQueries =
        useListServiceConnectionStoresByConnectionIds(
            sortedConnections.map((connection) => connection.id),
        )

    const storesByConnectionId = useMemo(() => {
        const map = new Map<string, StoreForServiceConnectionApiDTO[]>()
        sortedConnections.forEach((connection, index) => {
            map.set(connection.id, connectionStoreQueries[index]?.data ?? [])
        })
        return map
    }, [sortedConnections, connectionStoreQueries])

    const loadingByConnectionId = useMemo(() => {
        const map = new Map<string, boolean>()
        sortedConnections.forEach((connection, index) => {
            map.set(connection.id, !!connectionStoreQueries[index]?.isLoading)
        })
        return map
    }, [sortedConnections, connectionStoreQueries])

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

    if (isLoading) {
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

    function handleAssignedStore(storeId: number) {
        const integration = storeIntegrations.find(
            (store) => store.id === storeId,
        )
        if (!integration) {
            setInstallSuccessStore({ type: '', shopName: undefined })
            return
        }
        setInstallSuccessStore({
            type: integration.type,
            shopName: getShopNameFromStoreIntegration(integration),
        })
    }

    function handleViewActions() {
        const target = installSuccessStore
        setInstallSuccessStore(null)
        if (target && target.type && target.shopName) {
            history.push(
                `/app/ai-agent/${target.type}/${target.shopName}/actions`,
            )
        } else {
            history.push('/app/ai-agent')
        }
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
                            sortDirection={nameSortDirection ?? undefined}
                            onSortChange={setNameSortDirection}
                        >
                            Connection
                        </TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Store</TableHeaderCell>
                        <TableHeaderCell hug />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedConnections.map((connection) => {
                        const assignedStores =
                            storesByConnectionId.get(connection.id) ?? []
                        const disabledStoreIdsForRow = new Set<number>()
                        for (const [otherId, stores] of storesByConnectionId) {
                            if (otherId === connection.id) continue
                            for (const store of stores) {
                                disabledStoreIdsForRow.add(store.store_id)
                            }
                        }

                        return (
                            <ConnectionRow
                                key={connection.id}
                                appId={appId}
                                connection={connection}
                                availableStores={availableStores}
                                assignedStores={assignedStores}
                                isAssignedStoresLoading={
                                    loadingByConnectionId.get(connection.id) ??
                                    false
                                }
                                disabledStoreIds={disabledStoreIdsForRow}
                                onAssignStoreSuccess={handleAssignedStore}
                            />
                        )
                    })}
                </TableBody>
            </Table>
            <InstallSuccessModal
                isOpen={installSuccessStore !== null}
                onOpenChange={(open) => {
                    if (!open) setInstallSuccessStore(null)
                }}
                onViewActions={handleViewActions}
            />
        </Box>
    )
}

type RowProps = {
    appId: string
    connection: ServiceConnectionApiDTO
    availableStores: Store[]
    assignedStores: StoreForServiceConnectionApiDTO[]
    isAssignedStoresLoading: boolean
    disabledStoreIds: ReadonlySet<number>
    onAssignStoreSuccess: (storeId: number) => void
}

function ConnectionRow({
    appId,
    connection,
    availableStores,
    assignedStores,
    isAssignedStoresLoading,
    disabledStoreIds,
    onAssignStoreSuccess,
}: RowProps) {
    const history = useHistory()
    const editUrl = `/app/settings/integrations/app/${appId}/credentials/${connection.id}`
    const { mutateAsync: assignStore, isLoading: isAssigning } =
        useAssignServiceConnectionStore()
    const { mutateAsync: trashConnection, isLoading: isTrashing } =
        useTrashServiceConnection(appId)

    const [selectedStores, setSelectedStores] = useState<Store[]>([])
    const [isStoreSelectOpen, setIsStoreSelectOpen] = useState(false)
    const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false)

    const needsStore = assignedStores.length === 0
    const healthy = isServiceConnectionHealthy(connection.status)

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
            const firstStore = selectedStores[0]
            setSelectedStores([])
            setIsStoreSelectOpen(false)
            if (firstStore) {
                onAssignStoreSuccess(firstStore.id)
            }
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

    const storeItems = useMemo<(Store & { isDisabled: boolean })[]>(
        () =>
            availableStores.map((store) => ({
                ...store,
                isDisabled: disabledStoreIds.has(store.id),
            })),
        [availableStores, disabledStoreIds],
    )

    return (
        <TableRow
            onClick={() => history.push(editUrl)}
            tabIndex={0}
            aria-label={`Open ${connection.name}`}
        >
            <TableCell>
                <Box alignItems="center" gap="xs">
                    <Text variant="bold">{connection.name}</Text>
                    {!isAssignedStoresLoading && needsStore && (
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
                <Box alignItems="center" gap="xs">
                    <Tag size="sm" color={healthy ? 'green' : 'red'}>
                        {healthy ? 'Active' : 'Action needed'}
                    </Tag>
                    {!healthy && (
                        <Tooltip
                            delay={0}
                            trigger={
                                <Icon
                                    name="warning-triangle"
                                    size="sm"
                                    color="content-warning-default"
                                    alt="Update credentials to reconnect."
                                />
                            }
                        >
                            <TooltipContent title="Update credentials to reconnect." />
                        </Tooltip>
                    )}
                </Box>
            </TableCell>
            <TableCell>
                {isAssignedStoresLoading ? (
                    <Skeleton height="24px" width="160px" />
                ) : needsStore ? (
                    <MultiSelect
                        aria-label={`Connect store to ${connection.name}`}
                        items={storeItems}
                        selectedItems={selectedStores}
                        onSelect={(items) =>
                            setSelectedStores(
                                items.map(({ id, name }) => ({ id, name })),
                            )
                        }
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
                                onClick={(e) => e.stopPropagation()}
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
                                isDisabled={store.isDisabled}
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
                        stores={assignedStores}
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
                                onClick={(e) => e.stopPropagation()}
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
                    <Icon name="arrow-chevron-right" />
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
                            onClick={(e) => e.stopPropagation()}
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
