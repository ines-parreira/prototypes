import { useState } from 'react'

import type { ChartType } from '@repo/reporting'

export const useChartTypeToggle = (initialType: ChartType = 'donut') => {
    const [chartType, setChartType] = useState<ChartType>(initialType)

    return {
        chartType,
        setChartType,
    }
}
