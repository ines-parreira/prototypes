import { createContext, useContext, useEffect } from 'react'

import { usePrevious } from '@repo/hooks'
import _noop from 'lodash/noop'

import type { StoreIntegration } from 'models/integration/types'

export type ReportOrderIssueScenarioFormContextType = {
    isUpdatePending: boolean
    errors: Record<string, true>
    hasError: boolean
    setError: (path: string, hasError: boolean) => void
    storeIntegration: StoreIntegration | undefined
}

const ReportOrderIssueScenarioFormContext =
    createContext<ReportOrderIssueScenarioFormContextType>({
        isUpdatePending: false,
        errors: {},
        hasError: false,
        setError: _noop,
        storeIntegration: undefined,
    })

export const useReportOrderIssueScenarioFormContext = () =>
    useContext(ReportOrderIssueScenarioFormContext)

export const usePropagateError = (path: string, hasError: boolean) => {
    const { setError } = useReportOrderIssueScenarioFormContext()
    const hadError = usePrevious(hasError)

    useEffect(() => {
        if (hasError) {
            setError(path, true)
        } else if (hadError) {
            setError(path, false)
        }

        return () => {
            if (hadError) {
                setError(path, false)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, hasError, hadError])
}

export default ReportOrderIssueScenarioFormContext
