import React from 'react'
import _keyBy from 'lodash/keyBy'
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

import {getHelpcentersResponseFixture} from '../../fixtures/getHelpcenterResponse.fixture'

import {useCurrentHelpCenter} from '../useCurrentHelpCenter'

const mockedGetHelpCenter = jest.fn().mockResolvedValue({
    data: getHelpcentersResponseFixture[0],
})

const mockedChangeViewLanguage = jest.fn().mockReturnValue({
    type: UiActions.ChangeLanguage,
    payload: {},
})

const mockedHelpCentersFetched = jest.fn().mockReturnValue({
    type: HELPCENTERS_FETCHED,
    payload: [],
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: () => ({
            client: {
                getHelpCenter: mockedGetHelpCenter,
            },
        }),
    }
})

const dependencyWrapper: (
    state: Partial<RootState>
) => React.ComponentType<any> = (state) => ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(state as RootState)}>{children}</Provider>

describe('useCurrentHelpCenter()', () => {
    jest.mock('../../../../../state/helpCenter/ui/actions', () => ({
        changeViewLanguage: mockedChangeViewLanguage,
    }))
    jest.mock('../../../../../state/entities/helpCenters/actions', () => ({
        helpCentersFetched: mockedHelpCentersFetched,
    }))

    it('finishes loading once the requests are done', async () => {
        const defaultState: Partial<RootState> = {
            entities: {
                helpCenters: {},
            } as any,
            helpCenter: {
                ui: {...uiState, currentId: 1},
                articles: articlesState,
                categories: categoriesState,
            },
        }
        const {result} = renderHook(useCurrentHelpCenter, {
            wrapper: dependencyWrapper(defaultState),
        })
        expect(result.current.isLoading).toBeTruthy()

        await waitFor(() => !!result.current.data)

        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.data).toEqual(
            getHelpcentersResponseFixture.find(
                (helpCenter) => helpCenter.id === 1
            )
        )
    })

    it('returns the data from store if it is available', () => {
        const dataState: Partial<RootState> = {
            entities: {
                helpCenters: _keyBy(getHelpcentersResponseFixture, 'id'),
            } as any,
            helpCenter: {
                ui: {...uiState, currentId: 1},
                articles: articlesState,
                categories: categoriesState,
            },
        }
        const {result} = renderHook(useCurrentHelpCenter, {
            wrapper: dependencyWrapper(dataState),
        })

        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.data).toEqual(
            getHelpcentersResponseFixture.find(
                (helpCenter) => helpCenter.id === 1
            )
        )
    })
})
