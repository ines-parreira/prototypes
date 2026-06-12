import { createContext, useContext, useEffect } from 'react'
import { noop } from '@gorgias/toolkit'

export type ScenarioFormContextType = {
    setError: (path: string, hasError: boolean) => void
}

export const ScenarioFormContext = createContext<ScenarioFormContextType>({
    setError: noop,
})

export const useScenarioFormContext = () => useContext(ScenarioFormContext)

export const usePropagateError = (path: string, hasError: boolean) => {
    const { setError } = useScenarioFormContext()

    useEffect(() => {
        setError(path, hasError)

        return () => {
            setError(path, false)
        }
    }, [path, hasError, setError])
}
