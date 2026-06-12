import { useEffect, useMemo, useState } from 'react'
import { uniqueId } from '@gorgias/toolkit'
import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'

import { ReportOrderIssueScenarioItem } from './ReportOrderIssueScenarioItem'

type Props = {
    scenarios: SelfServiceReportIssueCase[]
    onReorder: (scenarios: SelfServiceReportIssueCase[]) => void
}

export const ReportOrderIssueScenarioList = ({
    scenarios,
    onReorder,
}: Props) => {
    const scenariosWithId = useMemo(
        () => scenarios.map((scenario) => ({ ...scenario, id: uniqueId() })),
        [scenarios],
    )

    const [dirtyScenarios, setDirtyScenarios] = useState(scenariosWithId)

    useEffect(() => {
        setDirtyScenarios(scenariosWithId)
    }, [scenariosWithId])

    const handleMove = (dragIndex: number, hoverIndex: number) => {
        const next = [...dirtyScenarios]
        const item = next[dragIndex]

        if (!item) {
            return
        }

        next.splice(dragIndex, 1)
        next.splice(hoverIndex, 0, item)
        setDirtyScenarios(next)
    }

    const handleDrop = () => {
        onReorder(dirtyScenarios.map(({ id: __, ...scenario }) => scenario))
    }

    const handleCancel = () => {
        setDirtyScenarios(scenariosWithId)
    }

    return (
        <div>
            {dirtyScenarios.map(({ id, ...scenario }, index) => (
                <ReportOrderIssueScenarioItem
                    key={id}
                    id={id}
                    position={index}
                    onMove={handleMove}
                    onDrop={handleDrop}
                    onCancel={handleCancel}
                    isDraggable={index !== dirtyScenarios.length - 1}
                    scenario={scenario}
                />
            ))}
        </div>
    )
}
