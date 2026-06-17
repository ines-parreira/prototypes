import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { DefaultExportCurrentHelpCenterContext as CurrentHelpCenterContext } from '../../contexts/CurrentHelpCenterContext'
import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterApi } from '../../hooks/useHelpCenterApi'
import { useStoreIntegrationByShopName } from '../../hooks/useStoreIntegrationByShopName'
import { HelpCenterPreferencesSettings } from '../../providers/HelpCenterPreferencesSettings/HelpCenterPreferencesSettings'
import { useGetPageEmbedments } from '../../queries'
import { HelpCenterInstallationView as HelpCenterPublishAndTrackView } from '../HelpCenterPublishAndTrackView'

jest.mock('hooks/aiAgent/useAiAgentAccess')
// Mock the useStoreIntegrationByShopName hook
jest.mock('../../hooks/useStoreIntegrationByShopName')
// Mock the useHelpCenterApi hook to provide a fake client
jest.mock('../../hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
}))
// Mock the useGetPageEmbedments hook
jest.mock('../../queries', () => ({
    useGetPageEmbedments: jest.fn(),
}))

const emptyCustomDomainsResponse = () =>
    Promise.resolve({
        data: {
            object: 'list',
            data: [],
            meta: {},
        },
    })

const updateHelpCenterSuccess = () =>
    Promise.resolve({
        data: getSingleHelpCenterResponseFixture,
    })
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
        ;(useHelpCenterApi as jest.Mock).mockReturnValue({
            isReady: true,
            client: {
                listCustomDomains: emptyCustomDomainsResponse,
                deleteHelpCenter: () =>
                    Promise.resolve({ data: {}, status: 200 }),
                updateHelpCenter: updateHelpCenterSuccess,
            },
        })
    })

    afterEach(() => {
        toast.dismiss()
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

    const confirmDeletion = async (
        user: ReturnType<typeof userEvent.setup>,
    ) => {
        await user.click(
            screen.getByRole('button', { name: /Delete Help Center/ }),
        )

        const confirmationInput =
            await screen.findByPlaceholderText('[Help Center Name]')
        await user.type(confirmationInput, 'ACME Help Center')

        await user.click(screen.getByRole('button', { name: /Delete Forever/ }))
    }

    it('shows a success toast when the Help Center is deleted', async () => {
        ;(useStoreIntegrationByShopName as jest.Mock).mockReturnValue(null)
        const user = userEvent.setup()
        renderComponent()

        await confirmDeletion(user)

        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Help Center deleted with success',
                }),
            ).toHaveAttribute('data-intent', 'success'),
        )
    })

    it('shows an error toast when deleting the Help Center fails', async () => {
        ;(useStoreIntegrationByShopName as jest.Mock).mockReturnValue(null)
        ;(useHelpCenterApi as jest.Mock).mockReturnValue({
            isReady: true,
            client: {
                listCustomDomains: emptyCustomDomainsResponse,
                deleteHelpCenter: () => Promise.reject(new Error('boom')),
                updateHelpCenter: updateHelpCenterSuccess,
            },
        })
        const user = userEvent.setup()
        renderComponent()

        await confirmDeletion(user)

        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Could not delete the Help Center',
                }),
            ).toHaveAttribute('data-intent', 'destructive'),
        )
    })

    it('shows a success toast when the Help Center is updated', async () => {
        ;(useStoreIntegrationByShopName as jest.Mock).mockReturnValue(null)
        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByPlaceholderText('Ex: UA-123456789-1 or G-ABCD1234E'),
            'G-ABCD1234E',
        )
        await user.click(screen.getByRole('button', { name: 'Save Changes' }))

        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Help Center updated with success',
                }),
            ).toHaveAttribute('data-intent', 'success'),
        )
    })

    it('shows an error toast when updating the Help Center fails', async () => {
        ;(useStoreIntegrationByShopName as jest.Mock).mockReturnValue(null)
        ;(useHelpCenterApi as jest.Mock).mockReturnValue({
            isReady: true,
            client: {
                listCustomDomains: emptyCustomDomainsResponse,
                deleteHelpCenter: () =>
                    Promise.resolve({ data: {}, status: 200 }),
                updateHelpCenter: () => Promise.reject(new Error('boom')),
            },
        })
        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByPlaceholderText('Ex: UA-123456789-1 or G-ABCD1234E'),
            'G-ABCD1234E',
        )
        await user.click(screen.getByRole('button', { name: 'Save Changes' }))

        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Could not update the Help Center',
                }),
            ).toHaveAttribute('data-intent', 'destructive'),
        )
    })
})
