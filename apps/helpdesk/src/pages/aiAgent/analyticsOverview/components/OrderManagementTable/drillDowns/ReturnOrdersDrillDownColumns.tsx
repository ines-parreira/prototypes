import {
    Box,
    createColumnHelper,
    DataTableBaseCell,
    OverflowTooltip,
    Text,
} from '@gorgias/axiom'
import type { DataTableColumnDef } from '@gorgias/axiom'

import { SELECTABLE_REASONS_DROPDOWN_OPTIONS } from 'models/selfServiceConfiguration/constants'
import type { ReturnOrdersRow } from 'pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData'

function formatIssueReasons(issues: Record<string, number>) {
    return Object.entries(issues)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value]) => {
            const label = SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                (option) => option.value === key,
            )?.label
            return `${label} (${value})`
        })
        .join(', ')
}

const columnHelper = createColumnHelper<ReturnOrdersRow>()

export const RETURN_ORDERS_DRILL_DOWN_COLUMNS: DataTableColumnDef<ReturnOrdersRow>[] =
    [
        columnHelper.accessor('Product', {
            header: 'Product',
            sortingFn: (rowA, rowB) => {
                const titleA = rowA.original.Product.name || ''
                const titleB = rowB.original.Product.name || ''
                return titleA.localeCompare(titleB)
            },
            cell: (info) => {
                const { image_url, name } = info.row.original.Product
                return (
                    <DataTableBaseCell
                        flexDirection="row"
                        alignItems="center"
                        gap="xs"
                        width={240}
                    >
                        <Box width={34} height={34}>
                            <img
                                src={image_url}
                                alt={name}
                                width={34}
                                height={34}
                                style={{
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                }}
                            />
                        </Box>
                        <OverflowTooltip>
                            <Text size="md" overflow="ellipsis" variant="bold">
                                {name}
                            </Text>
                        </OverflowTooltip>
                    </DataTableBaseCell>
                )
            },
        }),
        columnHelper.accessor('Issues reported', {
            header: 'Issues reported',
        }),
        columnHelper.accessor('Return requests', {
            header: 'Return requests',
        }),
        columnHelper.accessor('Issues description', {
            header: 'Issues description',
            enableSorting: false,
            cell: (info) => {
                const issues = info.row.original['Issues description']
                return (
                    <DataTableBaseCell width={240}>
                        <OverflowTooltip>
                            <Text overflow="ellipsis">
                                {formatIssueReasons(issues)}
                            </Text>
                        </OverflowTooltip>
                    </DataTableBaseCell>
                )
            },
        }),
    ]
