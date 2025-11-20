import type { ComponentType, Context } from 'react'
import { useContext } from 'react'

import { vi } from 'vitest'

export type ContextConsumerMock<ContextValue> = ComponentType & {
    getLastContextValue: () => ContextValue | undefined
}

export const createContextConsumer = <ContextValue,>(
    context: Context<ContextValue>,
): ContextConsumerMock<ContextValue> => {
    const renderContext = vi.fn().mockReturnValue(null)
    const ContextConsumerMock = () => {
        const contextValue = useContext(context)
        return renderContext(contextValue)
    }
    ContextConsumerMock.getLastContextValue = () => {
        const lastCall =
            renderContext.mock.calls[renderContext.mock.calls.length - 1]
        return lastCall?.[0]
    }
    return ContextConsumerMock
}
