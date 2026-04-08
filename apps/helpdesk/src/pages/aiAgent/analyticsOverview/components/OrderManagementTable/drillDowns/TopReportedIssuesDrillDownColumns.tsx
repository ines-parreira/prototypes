import {
    createColumnHelper,
    DataTableBaseCell,
    DataTableTextCell,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { DataTableColumnDef } from '@gorgias/axiom'

import type { TopReportedIssuesRow } from 'pages/aiAgent/analyticsOverview/hooks/useTopReportedIssuesDrillDownData'

const columnHelper = createColumnHelper<TopReportedIssuesRow>()

export function createTopReportedIssuesDrillDownColumns(
    previousPeriod: string,
): DataTableColumnDef<TopReportedIssuesRow>[] {
    return [
        columnHelper.accessor('Issue', {
            header: 'Issue',
        }),
        columnHelper.accessor('% of issues reported', {
            header: '% of issues reported',
            cell: (info) => (
                <DataTableBaseCell>
                    <Text>{info.getValue()}%</Text>
                </DataTableBaseCell>
            ),
        }),
        columnHelper.accessor('Tickets created', {
            header: 'Tickets created',
        }),
        columnHelper.accessor('Delta', {
            header: 'Delta',
            enableSorting: false,
            cell: (info) => {
                const value = info.getValue()
                const leadingSlot =
                    value === 0 ? (
                        <Icon name={'arrow-right'} />
                    ) : value > 0 ? (
                        <Icon
                            name={'arrow-up'}
                            color="content-success-default"
                        />
                    ) : (
                        <Icon
                            name={'arrow-down'}
                            color="content-error-default"
                        />
                    )
                return (
                    <Tooltip
                        trigger={
                            <DataTableTextCell
                                leadingSlot={leadingSlot}
                                {...info}
                            />
                        }
                    >
                        <TooltipContent
                            title={`Compared with ${previousPeriod}`}
                        />
                    </Tooltip>
                )
            },
        }),
    ]
}
