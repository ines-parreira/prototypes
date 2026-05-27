import { useEffect, useMemo, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { Box, Pagination, Text } from '@gorgias/axiom'
import { OrderDirection } from '@gorgias/helpdesk-types'

import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { handleError } from 'pages/aiAgent/actions/hooks/errorHandler'
import GuidanceReferenceProvider from 'pages/aiAgent/actions/providers/GuidanceReferenceProvider'
import StoreAppsProvider from 'pages/aiAgent/actions/providers/StoreAppsProvider'
import StoreTrackstarProvider from 'pages/aiAgent/actions/providers/StoreTrackstarProvider'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import ActionLibraryEmptyState from './components/ActionLibraryEmptyState'
import ActionLibraryHeader from './components/ActionLibraryHeader'
import ActionLibrarySearch from './components/ActionLibrarySearch'
import ActionLibraryUpdatesBanner from './components/ActionLibraryUpdatesBanner/ActionLibraryUpdatesBanner'
import ActionsTable from './components/ActionsTable'
import type { SortColumn } from './components/ActionsTable'
import {
    ACTION_LIBRARY_DESCRIPTION,
    ACTION_LIBRARY_PAGE_SIZE_OPTIONS,
    ACTION_LIBRARY_SKELETON_ROWS,
    ACTION_LIBRARY_TITLE,
} from './constants'
import { compareActionStatus, useActionStatuses } from './hooks/useActionStatus'
import { useFilteredActions } from './hooks/useFilteredActions'
import { usePaginatedActions } from './hooks/usePaginatedActions'
import { useServiceConnections } from './hooks/useServiceConnections'

import css from './ActionLibraryView.less'

const ActionLibraryView = () => {
    const history = useHistory()
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<{
        column: SortColumn
        direction: OrderDirection
    }>({
        column: 'app',
        direction: OrderDirection.Asc,
    })

    const {
        data: actions = [],
        isInitialLoading,
        isError,
        error,
    } = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })

    useEffect(() => {
        if (isError) {
            handleError(
                error,
                'Failed to load actions. Please try again later.',
            )
        }
    }, [error, isError])

    const serviceConnections = useServiceConnections({
        storeName: shopName,
        storeType: shopType,
    })

    const filtered = useFilteredActions(actions, search)
    const statuses = useActionStatuses(filtered, serviceConnections)

    const sorted = useMemo(() => {
        const list = [...filtered]
        list.sort((a, b) => {
            let cmp = 0
            if (sort.column === 'status') {
                cmp = compareActionStatus(
                    statuses.get(a.id) ?? 'enabled',
                    statuses.get(b.id) ?? 'enabled',
                )
            } else {
                const aKey =
                    sort.column === 'name'
                        ? a.name.toLowerCase()
                        : (a.apps?.[0]?.type ?? '')
                const bKey =
                    sort.column === 'name'
                        ? b.name.toLowerCase()
                        : (b.apps?.[0]?.type ?? '')
                if (aKey === bKey) return 0
                cmp = aKey < bKey ? -1 : 1
            }
            if (cmp === 0) return 0
            return sort.direction === OrderDirection.Asc ? cmp : -cmp
        })
        return list
    }, [filtered, sort, statuses])

    const { page, pageSize, totalPages, pageActions, setPage, setPageSize } =
        usePaginatedActions(sorted)

    const handleSortChange = (column: SortColumn) => {
        setSort((prev) =>
            prev.column === column
                ? {
                      column,
                      direction:
                          prev.direction === OrderDirection.Asc
                              ? OrderDirection.Desc
                              : OrderDirection.Asc,
                  }
                : { column, direction: OrderDirection.Asc },
        )
    }

    const showEmptyState = !isInitialLoading && actions.length === 0

    return (
        <AiAgentLayout
            shopName={shopName}
            title={ACTION_LIBRARY_TITLE}
            isLoading={false}
            className={css.container}
            hideTestButton
            pageHeaderClassName={css.pageHeader}
            headerNavbarClassName={css.headerNavbar}
            titleChildren={
                <ActionLibraryHeader
                    shopName={shopName}
                    shopType={shopType}
                    onCreate={() => history.push(routes.newAction())}
                />
            }
        >
            <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
                <StoreAppsProvider storeName={shopName} storeType={shopType}>
                    <GuidanceReferenceProvider actions={actions}>
                        <Box flexDirection="column" w="100%">
                            <Box px="lg" pt="lg" w="100%">
                                <ActionLibraryUpdatesBanner
                                    shopName={shopName}
                                />
                            </Box>
                            <Box p="lg" pb="md" w="100%">
                                <Text as="p" color="content-neutral-secondary">
                                    {ACTION_LIBRARY_DESCRIPTION}
                                </Text>
                            </Box>
                            {showEmptyState ? (
                                <Box flexDirection="column" gap="md" p="lg">
                                    <ActionLibraryEmptyState
                                        onCreate={() =>
                                            history.push(routes.newAction())
                                        }
                                    />
                                </Box>
                            ) : (
                                <Box flexDirection="column" gap="md">
                                    <Box px="lg" pt="lg">
                                        <ActionLibrarySearch
                                            value={search}
                                            onChange={setSearch}
                                            totalCount={actions.length}
                                            filteredCount={filtered.length}
                                        />
                                    </Box>
                                    <ActionsTable
                                        actions={pageActions}
                                        isLoading={isInitialLoading}
                                        shopName={shopName}
                                        shopType={shopType}
                                        serviceConnections={serviceConnections}
                                        sort={sort}
                                        onSortChange={handleSortChange}
                                        skeletonRows={
                                            ACTION_LIBRARY_SKELETON_ROWS
                                        }
                                    />
                                    <Box
                                        justifyContent="flex-end"
                                        px="lg"
                                        pb="lg"
                                    >
                                        <Pagination
                                            hasNextPage={page < totalPages}
                                            hasPreviousPage={page > 1}
                                            options={
                                                ACTION_LIBRARY_PAGE_SIZE_OPTIONS
                                            }
                                            defaultItemsPerPage={pageSize}
                                            onPageChange={(direction) =>
                                                setPage(
                                                    direction === 'next'
                                                        ? Math.min(
                                                              totalPages,
                                                              page + 1,
                                                          )
                                                        : Math.max(1, page - 1),
                                                )
                                            }
                                            onItemsPerPageChange={setPageSize}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </GuidanceReferenceProvider>
                </StoreAppsProvider>
            </StoreTrackstarProvider>
        </AiAgentLayout>
    )
}

export default ActionLibraryView
