import { createContext, useContext, useEffect } from 'react'
import { noop } from '@gorgias/toolkit'
import { usePrevious } from '@gorgias/toolkit-react'

import type { StoreIntegration } from 'models/integration/types'

export type ReturnOrderFlowViewContextType = {
    storeIntegration: StoreIntegration | undefined
    setError: (path: string, hasError: boolean) => void
}

const ReturnOrderFlowViewContext =
    createContext<ReturnOrderFlowViewContextType>({
        storeIntegration: undefined,
        setError: noop,
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

export { ReturnOrderFlowViewContext }
