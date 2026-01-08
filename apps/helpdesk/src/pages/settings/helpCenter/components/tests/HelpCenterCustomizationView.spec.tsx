import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'
import { renderWithRouter } from 'utils/testing'

import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from '../../fixtures/getLocalesResponse.fixtures'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import * as helpCenterApi from '../../hooks/useHelpCenterApi'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import { useHasAccessToAILibrary } from '../AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import HelpCenterCustomizationView from '../HelpCenterCustomizationView'

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
    ui: { helpCenter: { ...uiState, currentId: 1 } } as any,
    billing: fromJS(billingState),
}
const store = mockStore(defaultState)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
mockUseAiAgentAccess.mockReturnValue({ hasAccess: false, isLoading: false })

jest.mock('../AIArticlesLibraryView/hooks/useHasAccessToAILibrary')
;(useHasAccessToAILibrary as jest.Mock).mockReturnValue(true)

jest.spyOn(helpCenterApi, 'useAbilityChecker').mockReturnValue({
    isPassingRulesCheck: () => true,
})

jest.mock('../../hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)

jest.mock('../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

jest.mock('pages/settings/billing/automate/AutomateSubscriptionModal', () => ({
    __esModule: true,
    default: () => null,
}))

describe('<HelpCenterCustomizationView />', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    const props = {}

    it('should render the component', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <HelpCenterCustomizationView {...props} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })
})
