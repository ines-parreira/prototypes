import { useDashboardContext } from '../../../contexts/DashboardContext'
import type { ManagedDashboardContextValue } from '../types'

export function useManagedDashboardContext<
    TChart extends string = string,
>(): ManagedDashboardContextValue<TChart> | null {
    return useDashboardContext() as ManagedDashboardContextValue<TChart> | null
}
