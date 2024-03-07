import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'

import {waitFor} from '@testing-library/react'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {
    getHelpcenterListByTypes,
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

jest.mock('state/entities/helpCenter/helpCenters', () => {
    const actual = jest.requireActual('state/entities/helpCenter/helpCenters')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        helpCentersFetched: jest.fn().mockReturnValue({
            type: 'HELPCENTER/HELPCENTERS_FETCHED',
            payload: {},
        }),
        getHelpcenterListByTypes: jest.fn().mockReturnValue(() => []),
    }
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {},
            },
        },
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
    it('finishes loading once the requests are done', async () => {
        const {result} = renderHook(
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
        await waitFor(() => {
            expect(result.current.isLoading).toBeFalsy()
            expect(result.current.hasMore).toEqual(false)
        })
    })

    it('saves the help centers once they are fetched', async () => {
        renderHook(
            () =>
                useHelpCenterList({
                    per_page: 5,
                }),
            {
                wrapper: dependencyWrapper,
            }
        )
        await waitFor(() => {
            expect(helpCentersFetched).toHaveBeenCalled()
        })
    })

    it('uses the getHelpcenterListByTypes selector', () => {
        renderHook(
            () =>
                useHelpCenterList({
                    per_page: 5,
                }),
            {
                wrapper: dependencyWrapper,
            }
        )
        expect(getHelpcenterListByTypes).toHaveBeenCalled()
    })
})
