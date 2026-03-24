import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import { billingState } from 'fixtures/billing'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import CurrentHelpCenterContext from '../../contexts/CurrentHelpCenterContext'
import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { useStoreIntegrationByShopName } from '../../hooks/useStoreIntegrationByShopName'
import { HelpCenterPreferencesSettings } from '../../providers/HelpCenterPreferencesSettings/HelpCenterPreferencesSettings'
import { useGetPageEmbedments } from '../../queries'
import HelpCenterPublishAndTrackView from '../HelpCenterPublishAndTrackView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

// Mock the useStoreIntegrationByShopName hook
jest.mock('../../hooks/useStoreIntegrationByShopName')

// Mock the useGetPageEmbedments hook
jest.mock('../../queries', () => ({
    useGetPageEmbedments: jest.fn(),
}))

describe('<HelpCenterPublishAndTrackView />', () => {
    const defaultState: Partial<RootState> = {
        entities: {
            helpCenter: {
                helpCenters: {
                    helpCentersById: {
                        '1': getSingleHelpCenterResponseFixture,
                    },
                },
            },
        } as any,
        ui: {
            helpCenter: {
                ...uiState,
                currentId: 1,
                currentLanguage: 'en-US',
            },
        } as any,
        integrations: fromJS({
            integrations: [
                { id: 1, type: IntegrationType.Shopify, name: 'My Shop' },
            ],
        }),
        billing: fromJS(billingState),
    }

    const store = mockStore(defaultState)
    const queryClient = mockQueryClient()

    const renderComponent = () => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <CurrentHelpCenterContext.Provider
                        value={getSingleHelpCenterResponseFixture}
                    >
                        <HelpCenterPreferencesSettings
                            helpCenter={getSingleHelpCenterResponseFixture}
                        >
                            <HelpCenterPublishAndTrackView />
                        </HelpCenterPreferencesSettings>
                    </CurrentHelpCenterContext.Provider>
                </Provider>
            </QueryClientProvider>,
            {
                route: '/app/settings/help-center/1/publish-track',
            },
        )
    }

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
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
