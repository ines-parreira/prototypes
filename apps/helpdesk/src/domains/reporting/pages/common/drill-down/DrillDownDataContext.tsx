import { createContext, useContext } from 'react'

import type { DrillDownDataHook } from 'domains/reporting/hooks/useDrillDownData'
import type {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'

type DrillDownData =
    | TicketDrillDownRowData
    | ConvertDrillDownRowData
    | VoiceCallDrillDownRowData

type DrillDownDataContextType = ReturnType<DrillDownDataHook<DrillDownData>>

const DrillDownDataContext = createContext<
    DrillDownDataContextType | undefined
>(undefined)

export const DrillDownDataProvider = DrillDownDataContext.Provider

export const useDrillDownDataContext = () => {
    return useContext(DrillDownDataContext)
}
