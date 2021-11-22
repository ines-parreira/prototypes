import React from 'react'
import _keyBy from 'lodash/keyBy'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'

import {getHelpCentersResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'

import {useCurrentHelpCenter} from '../useCurrentHelpCenter'

const mockedGetHelpCenter = jest.fn().mockResolvedValue({
    data: getHelpCentersResponseFixture.data[0],
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            client: {
                getHelpCenter: mockedGetHelpCenter,
            },
        }),
    }
})

const dependencyWrapper: (
    state: Partial<RootState>
) => React.ComponentType<any> =
    (state) =>
    ({children}: {children: Element}) =>
        <Provider store={mockStore(state as RootState)}>{children}</Provider>

describe('useCurrentHelpCenter()', () => {
    it('returns the data from store if it is available', () => {
        const dataState: Partial<RootState> = {
            entities: {
                helpCenters: _keyBy(getHelpCentersResponseFixture.data, 'id'),
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

        expect(result.current.helpCenter).toEqual(
            getHelpCentersResponseFixture.data.find(
                (helpCenter) => helpCenter.id === 1
            )
        )
    })
})
