import { ComponentType, Context, useContext } from 'react'

export type ContextConsumerMock<ContextValue> = ComponentType & {
    getLastContextValue: () => ContextValue | undefined
}

export const createContextConsumer = <ContextValue,>(
    context: Context<ContextValue>,
): ContextConsumerMock<ContextValue> => {
    const renderContext = jest
        .fn()
        .mockReturnValue(null) as jest.MockedFunction<
        (value: ContextValue) => null
    >
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
