import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { Box, Text } from '@gorgias/axiom'
import { OrderDirection } from '@gorgias/helpdesk-types'

import { ACTION_LIBRARY_APP_COLUMN_WIDTH } from '../constants'
import type { ServiceConnectionsResult } from '../hooks/useServiceConnections'
import ActionsTableRow from './ActionsTableRow'
import ActionsTableSkeleton from './ActionsTableSkeleton'

export type SortColumn = 'app' | 'name' | 'status'

export type SortState = {
    column: SortColumn
    direction: OrderDirection
}

type Props = {
    actions: StoreWorkflowsConfiguration[]
    isLoading: boolean
    shopName: string
    shopType: 'shopify'
    serviceConnections: ServiceConnectionsResult
    sort: SortState
    onSortChange: (column: SortColumn) => void
    skeletonRows: number
}

const ariaSortFor = (
    sort: SortState,
    column: SortColumn,
): 'ascending' | 'descending' | 'none' => {
    if (sort.column !== column) return 'none'
    return sort.direction === OrderDirection.Asc ? 'ascending' : 'descending'
}

const ActionsTable = ({
    actions,
    isLoading,
    shopName,
    shopType,
    serviceConnections,
    sort,
    onSortChange,
    skeletonRows,
}: Props) => {
    return (
        <TableWrapper height="compact" aria-busy={isLoading || undefined}>
            <TableHead>
                <HeaderCellProperty
                    title="App"
                    style={{ width: ACTION_LIBRARY_APP_COLUMN_WIDTH }}
                    justifyContent="right"
                    wrapContent
                    aria-sort={ariaSortFor(sort, 'app')}
                    scope="col"
                    direction={
                        sort.column === 'app' ? sort.direction : undefined
                    }
                    isOrderedBy={sort.column === 'app'}
                    onClick={() => onSortChange('app')}
                />
                <HeaderCellProperty
                    title="Action"
                    style={{ width: 320 }}
                    aria-sort={ariaSortFor(sort, 'name')}
                    scope="col"
                    direction={
                        sort.column === 'name' ? sort.direction : undefined
                    }
                    isOrderedBy={sort.column === 'name'}
                    onClick={() => onSortChange('name')}
                />
                <HeaderCell width="100%" scope="col" />
                <HeaderCellProperty
                    title="Status"
                    style={{ width: 100 }}
                    aria-sort={ariaSortFor(sort, 'status')}
                    scope="col"
                    direction={
                        sort.column === 'status' ? sort.direction : undefined
                    }
                    isOrderedBy={sort.column === 'status'}
                    onClick={() => onSortChange('status')}
                />
                <HeaderCellProperty
                    title="Autonomous"
                    style={{ width: 110 }}
                    scope="col"
                    tooltip={
                        <Box flexDirection="column" gap="xxxxs">
                            <Text variant="bold">Autonomous</Text>
                            <Text>
                                AI Agent can run autonomous actions on their
                                own. Other actions only run when referenced
                                inside a skill or guidance.
                            </Text>
                        </Box>
                    }
                />
                <HeaderCellProperty
                    title="Used in"
                    style={{ width: 180 }}
                    scope="col"
                    tooltip={
                        <Box flexDirection="column" gap="xxxxs">
                            <Text variant="bold">Used in</Text>
                            <Text>
                                Skills and guidance that reference this action.
                            </Text>
                        </Box>
                    }
                />
                <HeaderCell style={{ width: 56 }} scope="col" />
            </TableHead>
            {isLoading ? (
                <ActionsTableSkeleton rows={skeletonRows} />
            ) : (
                <TableBody>
                    {actions.map((action) => (
                        <ActionsTableRow
                            key={action.id}
                            action={action}
                            shopName={shopName}
                            shopType={shopType}
                            serviceConnections={serviceConnections}
                        />
                    ))}
                </TableBody>
            )}
        </TableWrapper>
    )
}

export default ActionsTable
