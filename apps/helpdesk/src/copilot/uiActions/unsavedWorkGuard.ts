import { useEffect, useRef } from 'react'

/**
 * Registry of UI surfaces that currently hold unsaved edits. The copilot
 * follow-mode navigation provider reads this through `hasBlockingUnsavedWork`
 * to avoid navigating away from (and discarding) in-progress work.
 *
 * Each dirty surface registers a unique token; navigation is blocked while any
 * token is present.
 */
const dirtySources = new Set<number>()

let nextToken = 0

const acquireToken = (): number => {
    nextToken += 1
    return nextToken
}

export const hasBlockingUnsavedWork = (): boolean => dirtySources.size > 0

/**
 * Registers the calling surface as dirty while `isDirty` is true. The token is
 * always released on unmount, so the registry never leaks.
 */
export const useCopilotNavigationGuard = (isDirty: boolean): void => {
    const tokenRef = useRef<number | null>(null)

    if (tokenRef.current === null) {
        tokenRef.current = acquireToken()
    }

    useEffect(() => {
        const token = tokenRef.current

        if (token === null) {
            return
        }

        if (isDirty) {
            dirtySources.add(token)
        } else {
            dirtySources.delete(token)
        }
    }, [isDirty])

    useEffect(() => {
        const token = tokenRef.current

        return () => {
            if (token !== null) {
                dirtySources.delete(token)
            }
        }
    }, [])
}
