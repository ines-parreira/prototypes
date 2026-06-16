import { formatDatetime } from '@repo/utils'
import type { DateTimeResultFormatType } from '@repo/utils'
import {
    Box,
    createColumnHelper,
    DataTableBaseCell,
    DataTableOverflowListCell,
    DataTableSelectFilter,
    DataTableTextCell,
    ListItem,
    Tag,
    Text,
} from '@gorgias/axiom'
import type { MetricCard } from '@gorgias/helpdesk-queries'

import {
    METRIC_CATEGORY_BY_ID,
    METRIC_CATEGORY_COLUMN_ID,
    METRIC_CATEGORY_OPTIONS,
} from 'domains/reporting/pages/metrics-glossary/constants'
import type { MetricCategoryOption } from 'domains/reporting/pages/metrics-glossary/constants'

const columnHelper = createColumnHelper<MetricCard>()

function getCategoryLabel(category: string) {
    return METRIC_CATEGORY_BY_ID.get(category)?.label ?? category
}

export const getMetricsGlossaryColumns = (
    datetimeFormat: DateTimeResultFormatType,
) => [
    columnHelper.accessor((card) => card.title, {
        id: 'title',
        header: 'Metric',
        enableSorting: true,
        cell: (info) => (
            <DataTableBaseCell {...info}>
                <Box flexDirection="column" gap="xxxs" minWidth={0}>
                    <Text
                        variant="bold"
                        color="content-neutral-default"
                        overflow="ellipsis"
                    >
                        {info.row.original.title}
                    </Text>
                    <Text
                        size="sm"
                        color="content-neutral-secondary"
                        overflow="ellipsis"
                    >
                        {info.row.original.public.definition}
                    </Text>
                </Box>
            </DataTableBaseCell>
        ),
    }),
    columnHelper.accessor((card) => card.category, {
        id: METRIC_CATEGORY_COLUMN_ID,
        header: 'Category',
        hug: true,
        minSize: 150,
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
            getCategoryLabel(rowA.original.category).localeCompare(
                getCategoryLabel(rowB.original.category),
            ),
        cell: (info) => {
            const option = METRIC_CATEGORY_BY_ID.get(info.getValue())
            return (
                <DataTableBaseCell {...info}>
                    <Tag color={option?.color ?? 'grey'}>
                        {option?.label ?? info.getValue()}
                    </Tag>
                </DataTableBaseCell>
            )
        },
        filter: (
            <DataTableSelectFilter items={METRIC_CATEGORY_OPTIONS} keyName="id">
                {(option: MetricCategoryOption) => (
                    <ListItem label={option.label} />
                )}
            </DataTableSelectFilter>
        ),
    }),
    columnHelper.accessor((card) => card.used_in_reports, {
        id: 'used_in_reports',
        header: 'Used in',
        minSize: 250,
        enableSorting: false,
        cell: (info) => (
            <DataTableOverflowListCell
                {...info}
                items={info.getValue()}
                gap="xxxs"
            >
                {(report) => <Tag>{report}</Tag>}
            </DataTableOverflowListCell>
        ),
    }),
    columnHelper.accessor((card) => card.definition_revised_at, {
        id: 'definition_revised_at',
        header: 'Last updated',
        hug: true,
        enableSorting: true,
        cell: (info) => (
            <DataTableTextCell {...info} color="content-neutral-default">
                {formatDatetime(info.getValue(), datetimeFormat)}
            </DataTableTextCell>
        ),
    }),
]
