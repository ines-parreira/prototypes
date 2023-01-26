import {createContext, useContext, useEffect} from 'react'
import {usePrevious} from 'react-use'
import _noop from 'lodash/noop'

export type QuickResponsesViewContextType = {
    isUpdatePending: boolean
    hasError: boolean
    setError: (path: string, hasError: boolean) => void
    isLimitReached: boolean
}

const QuickResponsesViewContext = createContext<QuickResponsesViewContextType>({
    isUpdatePending: false,
    hasError: false,
    setError: _noop,
    isLimitReached: false,
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
