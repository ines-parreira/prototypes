import { act, assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useSyncPinnedFilter } from 'domains/reporting/hooks/filters/useSyncPinnedFilter'
import { SavedFilter } from 'domains/reporting/models/stat/types'
import {
    actions,
    initialState as uiFiltersInitialState,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import { RootState, StoreDispatch } from 'state/types'

jest.mock('hooks/useAppDispatch')

const useAppDispatchMock = assumeMock(useAppDispatch)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const renderHookWithStore = (state: Partial<RootState>) => {
    const store = mockStore(state)
    return renderHook(() => useSyncPinnedFilter(), {
        wrapper: ({ children }) => (
            <Provider store={store}>{children}</Provider>
        ),
    })
}

describe('useSyncPinnedFilter', () => {
    const savedFilter = { id: 123, name: 'my filter' } as SavedFilter
    const otherSavedFilter = { id: 456, name: 'your filter' } as SavedFilter

    const defaultState = {
        ui: {
            stats: {
                filters: uiFiltersInitialState,
            },
        },
    } as Partial<RootState>

    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('returns a function', () => {
        const { result } = renderHookWithStore(defaultState)

        expect(typeof result.current).toBe('function')
    })

    it('applies given filter when no filter is currently applied', () => {
        const { result } = renderHookWithStore(defaultState)

        act(() => {
            result.current(savedFilter)
        })

        expect(dispatchMock).toHaveBeenCalledWith(
            actions.applyPinnedFilter(savedFilter),
        )
    })

    it('applies given filter when different filter is currently applied', () => {
        const stateWithAppliedFilter = {
            ...defaultState,
            ui: {
                stats: {
                    filters: {
                        ...uiFiltersInitialState,
                        pinnedSavedFilter: otherSavedFilter,
                    },
                },
            },
        } as Partial<RootState>

        const { result } = renderHookWithStore(stateWithAppliedFilter)

        act(() => {
            result.current(savedFilter)
        })

        expect(dispatchMock).toHaveBeenCalledWith(
            actions.applyPinnedFilter(savedFilter),
        )
    })

    it('does not apply filter when same filter is already applied', () => {
        const stateWithSameFilter = {
            ...defaultState,
            ui: {
                stats: {
                    filters: {
                        ...uiFiltersInitialState,
                        pinnedSavedFilter: savedFilter,
                    },
                },
            },
        } as Partial<RootState>

        const { result } = renderHookWithStore(stateWithSameFilter)

        act(() => {
            result.current(savedFilter)
        })

        expect(dispatchMock).not.toHaveBeenCalled()
    })

    it('calls cleanup function when same filter is applied', () => {
        const stateWithSameFilter = {
            ...defaultState,
            ui: {
                stats: {
                    filters: {
                        ...uiFiltersInitialState,
                        pinnedSavedFilter: savedFilter,
                    },
                },
            },
        } as Partial<RootState>

        const { result } = renderHookWithStore(stateWithSameFilter)

        let cleanup: (() => void) | undefined

        act(() => {
            cleanup = result.current(savedFilter)
        })

        expect(cleanup).toBeInstanceOf(Function)

        act(() => {
            cleanup?.()
        })

        expect(dispatchMock).toHaveBeenCalledWith(
            actions.clearPinnedFilterDraft(),
        )
    })

    it('does not call cleanup function when different filter is applied', () => {
        const stateWithDifferentFilter = {
            ...defaultState,
            ui: {
                stats: {
                    filters: {
                        ...uiFiltersInitialState,
                        pinnedSavedFilter: otherSavedFilter,
                    },
                },
            },
        } as Partial<RootState>

        const { result } = renderHookWithStore(stateWithDifferentFilter)

        let cleanup: (() => void) | undefined

        act(() => {
            cleanup = result.current(savedFilter)
        })

        dispatchMock.mockClear()

        act(() => {
            cleanup?.()
        })

        expect(dispatchMock).not.toHaveBeenCalledWith(
            actions.clearPinnedFilterDraft(),
        )
    })
})
