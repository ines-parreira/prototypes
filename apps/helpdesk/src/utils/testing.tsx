import type { ReactElement } from 'react'

import type { shortcutManager } from '@repo/utils'
import type { RenderOptions } from '@testing-library/react'
import { act, render } from '@testing-library/react'
import type { BackendFactory } from 'dnd-core'
import type { History } from 'history'
import { createMemoryHistory } from 'history'
import _findLast from 'lodash/findLast'
import _last from 'lodash/last'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { Route, Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState } from 'state/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

const middlewares = [thunk]

/**
 * Mock a Redux store
 */
export const mockStore = <T extends object>(store: T) =>
    configureMockStore(middlewares)(store)

export type RenderWithRouterParams = {
    options?: Omit<RenderOptions, 'wrapper'>
    path?: string
    route?: string
    history?: History
}

export const renderWithStore = (
    ui: ReactElement,
    state: Partial<RootState>,
) => {
    const store = configureMockStore(middlewares)(state)
    const component = render(<Provider store={store}>{ui}</Provider>)
    return {
        ...component,
        rerenderComponent: (
            newUi: ReactElement,
            newState: Partial<RootState>,
        ) =>
            component.rerender(
                <Provider store={configureMockStore(middlewares)(newState)}>
                    {newUi}
                </Provider>,
            ),
        store,
    }
}

export const renderWithRouter = (
    ui: ReactElement,
    {
        options,
        path = '/',
        route = '/',
        history = createMemoryHistory({ initialEntries: [route] }),
    }: RenderWithRouterParams = {},
) => {
    const component = render(ui, {
        wrapper: ({ children }: any) => (
            <Router history={history}>
                <Route path={path}>{children}</Route>
            </Router>
        ),
        ...options,
    })
    return {
        ...component,
        rerenderComponent: (newUi: ReactElement) =>
            component.rerender(
                <Router history={history}>
                    <Route path={path}>{newUi}</Route>
                </Router>,
            ),
        history,
    }
}

export type RenderWithDnDParams = {
    options?: Omit<RenderOptions, 'wrapper'>
    backend?: BackendFactory
}

export const renderWithDnD = (
    ui: ReactElement,
    { options, backend = HTML5Backend }: RenderWithDnDParams = {},
) => {
    return render(ui, {
        wrapper: ({ children }: any) => (
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
        history = createMemoryHistory({ initialEntries: [route] }),
        backend = HTML5Backend,
    }: RenderWithRouterAndDnDParams = {},
) => {
    return render(ui, {
        wrapper: ({ children }: any) => (
            <DndProvider backend={backend}>
                <Router history={history}>
                    <Route path={path}>{children}</Route>
                </Router>
            </DndProvider>
        ),
        ...options,
    })
}

export const makeExecuteKeyboardAction = (
    shortcutManagerMock: jest.Mocked<typeof shortcutManager>,
    shortcutEventMock?: jest.Mocked<Event>,
    component?: string,
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
                  ([name]) => component === name,
              )
            : _last(shortcutManagerMock.bind.mock.calls)
        if (!lastCall) {
            return
        }
        const [, actions] = lastCall
        act(() => {
            ;(actions![shortcutName].action as (event: Event) => void)(
                eventMock,
            )
        })
    }
}

export function getCombinations<S extends object, T extends object>(
    props1: S[],
    props2: T[],
): Array<S & T> {
    const finalProps: Array<S & T> = []

    for (const prop1 of props1) {
        for (const prop2 of props2) {
            finalProps.push({ ...prop1, ...prop2 })
        }
    }

    return finalProps
}
