import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from '../../fixtures/getLocalesResponse.fixtures'
import { useCurrentHelpCenter } from '../../hooks/useCurrentHelpCenter'
import * as helpCenterApi from '../../hooks/useHelpCenterApi'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import { useHasAccessToAILibrary } from '../AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { HelpCenterCustomizationView } from '../HelpCenterCustomizationView'

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
    AutomateSubscriptionModal: () => null,
}))
describe('<HelpCenterCustomizationView />', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })
    const props = {}
    const renderComponent = () =>
        render(<HelpCenterCustomizationView {...props} />, {
            storeState: {
                integrations: fromJS({
                    integrations: [],
                }),
                ui: {
                    helpCenter: {
                        currentLanguage: 'en-US',
                        currentId: 1,
                    },
                },
            },
        })

    it('should render the component', () => {
        const { container } = renderComponent()
        expect(container).toMatchSnapshot()
    })
})
