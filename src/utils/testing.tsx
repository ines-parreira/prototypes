import React, {ComponentType, Context, ReactElement, useContext} from 'react'
import configureMockStore, {MockStore} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {shallow} from 'enzyme'
import {act, render, RenderOptions} from '@testing-library/react'
import {Route, Router} from 'react-router-dom'
import {createMemoryHistory, History} from 'history'
import _last from 'lodash/last'
import _findLast from 'lodash/findLast'
import {BackendFactory} from 'dnd-core'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {QueryClientProvider} from '@tanstack/react-query'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'

import shortcutManager from '../services/shortcutManager/shortcutManager'

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

/* render with React Query Client Provider */
export const renderWithRQProvider = (ui: ReactElement) => {
    const queryClient = createTestQueryClient()

    return render(ui, {
        wrapper: ({children}: any) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })
}

export type RenderWithDnDParams = {
    options?: Omit<RenderOptions, 'wrapper'>
    backend?: BackendFactory
}

export const renderWithDnD = (
    ui: ReactElement,
    {options, backend = HTML5Backend}: RenderWithDnDParams = {}
) => {
    return render(ui, {
        wrapper: ({children}: any) => (
            <DndProvider backend={backend}>{children}</DndProvider>
        ),
        ...options,
    })
}

export type RenderWithRouterAndDnDParams = RenderWithRouterParams &
    RenderWithDnDParams

export const renderWithRouterAndDnD = (
    ui: ReactElement,
    {
        options,
        path = '/',
        route = '/',
        history = createMemoryHistory({initialEntries: [route]}),
        backend = HTML5Backend,
    }: RenderWithRouterAndDnDParams = {}
) => {
    return render(ui, {
        wrapper: ({children}: any) => (
            <DndProvider backend={backend}>
                <Router history={history}>
                    <Route path={path}>{children}</Route>
                </Router>
            </DndProvider>
        ),
        ...options,
    })
}

export type ContextConsumerMock<ContextValue> = ComponentType & {
    getLastContextValue: () => ContextValue | undefined
}

export const createContextConsumer = <ContextValue,>(
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

export const mockProductionEnvironment = () => {
    window.DEVELOPMENT = false
    window.STAGING = false
    window.PRODUCTION = true
}

export const mockStagingEnvironment = () => {
    window.DEVELOPMENT = false
    window.STAGING = true
    window.PRODUCTION = true
}

export const mockDevelopmentEnvironment = () => {
    window.DEVELOPMENT = true
    window.STAGING = false
    window.PRODUCTION = false
}

export const flushPromises = () => new Promise(setImmediate)

export const makeExecuteKeyboardAction = (
    shortcutManagerMock: jest.Mocked<typeof shortcutManager>,
    shortcutEventMock?: jest.Mocked<Event>,
    component?: string
) => {
    const eventMock =
        shortcutEventMock ||
        ({
            preventDefault: jest.fn(),
            stopImmediatePropagation: jest.fn(),
        } as unknown as jest.Mocked<Event>)

    return (shortcutName: string) => {
        const lastCall = component
            ? _findLast(
                  shortcutManagerMock.bind.mock.calls,
                  ([name]) => component === name
              )
            : _last(shortcutManagerMock.bind.mock.calls)
        if (!lastCall) {
            return
        }
        const [, actions] = lastCall
        act(() => {
            ;(actions![shortcutName].action as (event: Event) => void)(
                eventMock
            )
        })
    }
}

export const assumeMock = <TFunction extends (...args: any[]) => any>(
    mock: TFunction
): jest.MockedFunction<TFunction> => {
    return mock as jest.MockedFunction<TFunction>
}
