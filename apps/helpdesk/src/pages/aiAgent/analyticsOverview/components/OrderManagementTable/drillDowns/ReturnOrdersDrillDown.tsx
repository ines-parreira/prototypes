import { useState } from 'react'

import { DrillDownSidePanel, DrillDownSidePanelTrigger } from '@repo/reporting'

import { useReturnOrdersDrillDownData } from 'pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData'

export const ReturnOrdersDrillDown = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { count, isLoading } = useReturnOrdersDrillDownData()

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
                description="Top Products with most issues and return requests."
                itemCount={count}
            >
                coming up
            </DrillDownSidePanel>
        </>
    )
}
