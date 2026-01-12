import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

type DonutChartHoverContextValue = {
    hoveredLegendItem: string | null
    setHoveredLegendItem: (name: string | null) => void
}

const DonutChartHoverContext =
    createContext<DonutChartHoverContextValue | null>(null)

export const useDonutChartHover = () => {
    const context = useContext(DonutChartHoverContext)
    if (!context) {
        throw new Error(
            'useDonutChartHover must be used within DonutChartHoverProvider',
        )
    }
    return context
}

type DonutChartHoverProviderProps = {
    children: ReactNode
}

export const DonutChartHoverProvider = ({
    children,
}: DonutChartHoverProviderProps) => {
    const [hoveredLegendItem, setHoveredLegendItem] = useState<string | null>(
        null,
    )

    return (
        <DonutChartHoverContext.Provider
            value={{ hoveredLegendItem, setHoveredLegendItem }}
        >
            {children}
        </DonutChartHoverContext.Provider>
    )
}
