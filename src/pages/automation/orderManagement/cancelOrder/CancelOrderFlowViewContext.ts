import {createContext, useContext, useEffect} from 'react'
import {usePrevious} from 'react-use'
import _noop from 'lodash/noop'

export type CancelOrderFlowViewContextType = {
    setError: (path: string, hasError: boolean) => void
}

const CancelOrderFlowViewContext =
    createContext<CancelOrderFlowViewContextType>({
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
