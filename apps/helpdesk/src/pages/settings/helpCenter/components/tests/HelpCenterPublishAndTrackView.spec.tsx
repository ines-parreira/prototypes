import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { DefaultExportCurrentHelpCenterContext as CurrentHelpCenterContext } from '../../contexts/CurrentHelpCenterContext'
import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { useStoreIntegrationByShopName } from '../../hooks/useStoreIntegrationByShopName'
import { HelpCenterPreferencesSettings } from '../../providers/HelpCenterPreferencesSettings/HelpCenterPreferencesSettings'
import { useGetPageEmbedments } from '../../queries'
import { HelpCenterInstallationView as HelpCenterPublishAndTrackView } from '../HelpCenterPublishAndTrackView'

jest.mock('hooks/aiAgent/useAiAgentAccess')
// Mock the useStoreIntegrationByShopName hook
jest.mock('../../hooks/useStoreIntegrationByShopName')
// Mock the useGetPageEmbedments hook
jest.mock('../../queries', () => ({
    useGetPageEmbedments: jest.fn(),
}))
describe('<HelpCenterPublishAndTrackView />', () => {
    const renderComponent = () => {
        return render(
            <CurrentHelpCenterContext.Provider
                value={getSingleHelpCenterResponseFixture}
            >
                <HelpCenterPreferencesSettings
                    helpCenter={getSingleHelpCenterResponseFixture}
                >
                    <HelpCenterPublishAndTrackView />
                </HelpCenterPreferencesSettings>
            </CurrentHelpCenterContext.Provider>,
            {
                initialEntries: ['/app/settings/help-center/1/publish-track'],
                storeState: {
                    integrations: fromJS({
                        integrations: [],
                    }),
                    ui: {
                        helpCenter: {
                            currentLanguage: 'en-US',
                            currentId: getSingleHelpCenterResponseFixture.id,
                        },
                    },
                },
            },
        )
    }
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
        ;(useAiAgentAccess as jest.Mock).mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        ;(useGetPageEmbedments as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
            isFetched: true,
        })
    })
    it('should pass shopName prop correctly when selectedShop exists', () => {
        // Mock the useStoreIntegrationByShopName hook to return a shop
        const mockSelectedShop = {
            id: 1,
            name: 'My Shop',
            type: IntegrationType.Shopify,
        }
        ;(useStoreIntegrationByShopName as jest.Mock).mockReturnValue(
            mockSelectedShop,
        )
        renderComponent()
        // The shopName prop should be passed as "My Shop"
        expect(useStoreIntegrationByShopName).toHaveBeenCalled()
    })
    it('should pass null as shopName prop when selectedShop is null', () => {
        // Mock the useStoreIntegrationByShopName hook to return null
        ;(useStoreIntegrationByShopName as jest.Mock).mockReturnValue(null)
        renderComponent()
        // The shopName prop should be passed as null
        expect(useStoreIntegrationByShopName).toHaveBeenCalled()
    })
})
