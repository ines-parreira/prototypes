import {createContext, useContext, useEffect} from 'react'
import _noop from 'lodash/noop'

import {StoreIntegration} from 'models/integration/types'
import usePrevious from 'hooks/usePrevious'

export type QuickResponsesViewContextType = {
    isUpdatePending: boolean
    hasError: boolean
    setError: (path: string, hasError: boolean) => void
    isLimitReached: boolean
    storeIntegration: StoreIntegration | undefined
}

const QuickResponsesViewContext = createContext<QuickResponsesViewContextType>({
    isUpdatePending: false,
    hasError: false,
    setError: _noop,
    isLimitReached: false,
    storeIntegration: undefined,
})

export const useQuickResponsesViewContext = () =>
    useContext(QuickResponsesViewContext)

export const usePropagateError = (path: string, hasError: boolean) => {
    const {setError} = useQuickResponsesViewContext()
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

export default QuickResponsesViewContext
