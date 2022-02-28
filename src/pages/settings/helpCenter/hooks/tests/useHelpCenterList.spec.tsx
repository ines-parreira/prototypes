import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {
    getHelpCenters,
    helpCentersFetched,
} from 'state/entities/helpCenter/helpCenters'

import {useHelpCenterList} from '../useHelpCenterList'

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                listHelpCenters: () =>
                    Promise.resolve({
                        data: {
                            data: [],
                            meta: {
                                page: 1,
                                nbPages: 1,
                            },
                        },
                    }),
            },
        }),
    }
})

jest.mock('state/entities/helpCenter/helpCenters', () => ({
    getHelpCenters: jest.fn(() => ({})),
    helpCentersFetched: jest.fn().mockReturnValue({
        type: 'HELPCENTER/HELPCENTERS_FETCHED',
        payload: {},
    }),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {},
    } as any,
    ui: {helpCenter: uiState} as any,
}

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useHelpCenterList', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('finishes loading once the requests are done', async () => {
        const {result, waitForNextUpdate} = renderHook(
            () =>
                useHelpCenterList({
                    per_page: 5,
                }),
            {
                wrapper: dependencyWrapper,
            }
        )
        expect(result.current.isLoading).toBeTruthy()
        expect(result.current.hasMore).toEqual(true)
        await waitForNextUpdate()
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.hasMore).toEqual(false)
    })

    it('saves the help centers once they are fetched', async () => {
        const {waitForNextUpdate} = renderHook(
            () =>
                useHelpCenterList({
                    per_page: 5,
                }),
            {
                wrapper: dependencyWrapper,
            }
        )
        await waitForNextUpdate()
        expect(helpCentersFetched).toHaveBeenCalled()
    })

    it('uses the getHelpCenters selector', () => {
        renderHook(
            () =>
                useHelpCenterList({
                    per_page: 5,
                }),
            {
                wrapper: dependencyWrapper,
            }
        )
        expect(getHelpCenters).toHaveBeenCalled()
    })
})
