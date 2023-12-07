import {createContext, useContext, useEffect} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {usePrevious} from 'react-use'
import _noop from 'lodash/noop'

import {StoreIntegration} from 'models/integration/types'

export type CancelOrderFlowViewContextType = {
    storeIntegration: StoreIntegration | undefined
    setError: (path: string, hasError: boolean) => void
}

const CancelOrderFlowViewContext =
    createContext<CancelOrderFlowViewContextType>({
        storeIntegration: undefined,
        setError: _noop,
    })

export const useCancelOrderFlowViewContext = () =>
    useContext(CancelOrderFlowViewContext)

export const usePropagateError = (path: string, hasError: boolean) => {
    const {setError} = useCancelOrderFlowViewContext()
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

export default CancelOrderFlowViewContext
