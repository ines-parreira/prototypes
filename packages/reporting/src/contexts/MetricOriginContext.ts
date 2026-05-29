import { createContext, useContext } from 'react'

type MetricOriginContextValue = {
    showMetricOrigin: boolean
}

export const MetricOriginContext =
    createContext<MetricOriginContextValue | null>(null)

export function useMetricOriginContext(): MetricOriginContextValue | null {
    return useContext(MetricOriginContext)
}
