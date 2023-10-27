import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {renderWithRouter} from 'utils/testing'
import {billingState} from 'fixtures/billing'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import HelpCenterCustomizationView from '../HelpCenterCustomizationView'
import {getSingleHelpCenterResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'
import * as helpCenterApi from '../../hooks/useHelpCenterApi'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            articles: articlesState,
            categories: categoriesState,
            helpCenters: {
                '1': getSingleHelpCenterResponseFixture,
            },
        },
    } as any,
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
    billing: fromJS(billingState),
}
const store = mockStore(defaultState)

jest.spyOn(helpCenterApi, 'useAbilityChecker').mockReturnValue({
    isPassingRulesCheck: () => true,
})

jest.mock('../../hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

describe('<HelpCenterCustomizationView />', () => {
    const props = {}

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <HelpCenterCustomizationView {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
