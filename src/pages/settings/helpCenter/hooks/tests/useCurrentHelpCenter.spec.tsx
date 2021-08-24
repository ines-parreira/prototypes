import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {waitFor} from '@testing-library/react'
import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {UiActions} from '../../../../../state/helpCenter/ui/types'
import {HELPCENTERS_FETCHED} from '../../../../../state/entities/helpCenters/constants'

import {useCurrentHelpCenter} from '../useCurrentHelpCenter'

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
            client: {
                getHelpCenter: jest.fn().mockResolvedValue({
                    data: {
                        id: 1,
                        default_locale: 'en-US',
                    },
                }),
            },
        }),
    }
})

const mockChangeViewLanguage = jest.fn().mockReturnValue({
    type: UiActions.ChangeLanguage,
    payload: {},
})

const mockHelpCentersFetched = jest.fn().mockReturnValue({
    type: HELPCENTERS_FETCHED,
    payload: [],
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
}

const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useCurrentHelpCenter()', () => {
    jest.mock('../../../../../state/helpCenter/ui/actions', () => ({
        changeViewLanguage: mockChangeViewLanguage,
    }))
    jest.mock('../../../../../state/entities/helpCenters/actions', () => ({
        helpCentersFetched: mockHelpCentersFetched,
    }))

    it('finishes loading once the requests are done', async () => {
        const {result} = renderHook(useCurrentHelpCenter, {
            wrapper: dependencyWrapper,
        })
        expect(result.current.isLoading).toBeTruthy()

        await waitFor(() => !!result.current.data)

        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.data).toEqual({
            id: 1,
            default_locale: 'en-US',
        })
    })
})
