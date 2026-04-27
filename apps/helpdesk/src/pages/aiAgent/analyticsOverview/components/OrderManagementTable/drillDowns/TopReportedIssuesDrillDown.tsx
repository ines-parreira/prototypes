import { useState } from 'react'

import { DrillDownSidePanel, DrillDownSidePanelTrigger } from '@repo/reporting'

import { DataTable, DataTablePagination } from '@gorgias/axiom'

import { useTopReportedIssuesDrillDownData } from 'pages/aiAgent/analyticsOverview/hooks/useTopReportedIssuesDrillDownData'

import { createTopReportedIssuesDrillDownColumns } from './TopReportedIssuesDrillDownColumns'

const PAGE_SIZE = 10

export const TopReportedIssuesDrillDown = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { rows, count, isLoading, isPeriodLimited, previousPeriod } =
        useTopReportedIssuesDrillDownData()

    return (
        <>
            <DrillDownSidePanelTrigger
                count={count}
                onClick={() => setIsOpen(true)}
                isDisabled={isLoading || count === 0}
            />
            <DrillDownSidePanel
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Report order issues"
                description={
                    isPeriodLimited
                        ? 'Top order issues reported. Showing data for the latest 90 days in the selected period.'
                        : 'Top order issues reported.'
                }
                itemCount={count}
                learnMoreHref="https://docs.gorgias.com/en-US/order-management-create-a-new-scenario-to-report-order-issues-81863"
            >
                <DataTable
                    data={rows}
                    columns={createTopReportedIssuesDrillDownColumns(
                        previousPeriod,
                    )}
                    isLoading={isLoading}
                    sorting={{ enable: true }}
                    pagination={{
                        enable: count > PAGE_SIZE,
                        defaultValue: { pageIndex: 0, pageSize: PAGE_SIZE },
                    }}
                    withBorder
                >
                    <DataTablePagination />
                </DataTable>
            </DrillDownSidePanel>
        </>
    )
}
