import type { Context } from 'react'
import { useContext } from 'react'

type NonUndefined<T> = T extends undefined ? never : T

export function useSafeContext<T>(contextArg: Context<T>): NonUndefined<T> {
    const context = useContext(contextArg)
    if (!contextArg.displayName) {
        throw new Error('Context must have a displayName')
    }

    if (context === undefined) {
        throw new TypeError(
            `${contextArg.displayName} must be used within a ${contextArg.displayName}.Provider`,
        )
    }
    return context as NonUndefined<T>
}
