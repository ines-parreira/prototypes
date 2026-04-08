import { useState } from 'react'

import { DrillDownSidePanel, DrillDownSidePanelTrigger } from '@repo/reporting'

import { DataTable, DataTablePagination } from '@gorgias/axiom'

import { useReturnOrdersDrillDownData } from 'pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData'

import { RETURN_ORDERS_DRILL_DOWN_COLUMNS } from './ReturnOrdersDrillDownColumns'

const PAGE_SIZE = 10

export const ReturnOrdersDrillDown = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { rows, count, isLoading, isPeriodLimited } =
        useReturnOrdersDrillDownData()

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
                title="Return orders"
                description={
                    isPeriodLimited
                        ? 'Top Products with most issues and return requests. Showing data for the latest 90 days in the selected period.'
                        : 'Top Products with most issues and return requests.'
                }
                itemCount={count}
            >
                <DataTable
                    data={rows}
                    columns={RETURN_ORDERS_DRILL_DOWN_COLUMNS}
                    isLoading={isLoading}
                    sorting={{ enable: true }}
                    pagination={{
                        enable: count > PAGE_SIZE,
                        value: { pageIndex: 0, pageSize: PAGE_SIZE },
                    }}
                    withBorder
                >
                    <DataTablePagination />
                </DataTable>
            </DrillDownSidePanel>
        </>
    )
}
