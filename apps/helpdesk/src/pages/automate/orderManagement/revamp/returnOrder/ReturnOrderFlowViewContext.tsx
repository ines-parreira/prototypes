import { createContext, useContext, useEffect } from 'react'

import { usePrevious } from '@repo/hooks'
import _noop from 'lodash/noop'

import type { StoreIntegration } from 'models/integration/types'

export type ReturnOrderFlowViewContextType = {
    storeIntegration: StoreIntegration | undefined
    setError: (path: string, hasError: boolean) => void
}

const ReturnOrderFlowViewContext =
    createContext<ReturnOrderFlowViewContextType>({
        storeIntegration: undefined,
        setError: _noop,
    })

export const useReturnOrderFlowViewContext = () =>
    useContext(ReturnOrderFlowViewContext)

export const usePropagateError = (path: string, hasError: boolean) => {
    const { setError } = useReturnOrderFlowViewContext()
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
    }, [path, hasError, hadError, setError])
}

export default ReturnOrderFlowViewContext
