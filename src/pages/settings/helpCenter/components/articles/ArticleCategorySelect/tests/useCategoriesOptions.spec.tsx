import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'
import {keyBy as _keyBy} from 'lodash'

import {HELP_CENTER_DEFAULT_LOCALE} from 'pages/settings/helpCenter/constants'
import {getCategoriesFlatSorted} from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {useHelpCenterIdParam} from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import {SelectableOption} from 'pages/common/forms/SelectField/types'

import {RootState, StoreDispatch} from 'state/types'
import {isNonRootCategory} from 'state/entities/helpCenter/categories'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import useCategoriesOptions from '../hooks/useCategoriesOptions'

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam')
;(useHelpCenterIdParam as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture.id
)

const categories = getCategoriesFlatSorted

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            ...helpCenterInitialState,
            categories: {categoriesById: _keyBy(categories, 'id')},
        },
    } as any,
    ui: {helpCenter: uiState} as any,
}

const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useCategoriesOptions()', () => {
    it('returns the category options', () => {
        const {result} = renderHook(
            () =>
                useCategoriesOptions({
                    locale: HELP_CENTER_DEFAULT_LOCALE,
                }),
            {
                wrapper: dependencyWrapper,
            }
        )

        const actualResult: SelectableOption[] = []
        result.current.forEach((option) => {
            if ('value' in option)
                actualResult.push({
                    text: option.text,
                    value: option.value,
                })
        })

        const expectedResult = [
            {value: 'null'},
            ...categories.filter(isNonRootCategory).map((category) => ({
                text: category.translation.title,
                value: category.id,
            })),
        ]

        expect(actualResult).toEqual(expectedResult)
    })
})
