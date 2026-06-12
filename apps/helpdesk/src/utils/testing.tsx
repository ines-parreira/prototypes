import type { shortcutManager } from '@repo/utils'
import { act } from '@testing-library/react'
import _findLast from 'lodash/findLast'
import _last from 'lodash/last'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]

/**
 * Mock a Redux store
 */
export const mockStore = <T extends object>(store: T) =>
    configureMockStore(middlewares)(store)

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
