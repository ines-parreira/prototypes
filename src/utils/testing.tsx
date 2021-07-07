import React, {ReactElement, Context, ComponentType, useContext} from 'react'
import configureMockStore, {MockStore} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {shallow} from 'enzyme'
import {render, RenderOptions} from '@testing-library/react'
import {Router, Route} from 'react-router-dom'
import {createMemoryHistory, History} from 'history'

const middlewares = [thunk]

/**
 * Mock a Redux store
 */
export const mockStore = (store: MockStore) =>
    configureMockStore(middlewares)(store)

/**
 * Render a React node with Redux store
 */
export const shallowWithStore = (
    component: ReactElement<any>,
    store: MockStore
) => shallow(component, {context: {store}})

export type RenderWithRouterParams = {
    options?: Omit<RenderOptions, 'wrapper'>
    path?: string
    route?: string
    history?: History
}

export const renderWithRouter = (
    ui: ReactElement,
    {
        options,
        path = '/',
        route = '/',
        history = createMemoryHistory({initialEntries: [route]}),
    }: RenderWithRouterParams = {}
) => {
    return render(ui, {
        wrapper: ({children}: any) => (
            <Router history={history}>
                <Route path={path}>{children}</Route>
            </Router>
        ),
        ...options,
    })
}

export type ContextConsumerMock<ContextValue> = ComponentType & {
    getLastContextValue: () => ContextValue | undefined
}

export const createContextConsumer = <ContextValue extends unknown>(
    context: Context<ContextValue>
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
