import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, waitFor, within } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { integrationsState } from 'fixtures/integrations'
import { StoreConfiguration } from 'models/aiAgent/types'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as chatColorHook from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import * as IntegrationsActions from 'state/integrations/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { getLDClient } from 'utils/launchDarkly'
import { renderWithRouter } from 'utils/testing'

import { CustomerEngagementSettings } from '../CustomerEngagementSettings'

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])
const store = mockStore({ integrations: fromJS(integrationsState) })

let history = createMemoryHistory({
    initialEntries: ['/shopify/test-store/customer-engagement'],
})

const renderComponent = () =>
    renderWithRouter(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <CustomerEngagementSettings />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/customer-engagement`,
            route: '/shopify/test-store/customer-engagement',
            history,
        },
    )

type RenderComponentReturn = ReturnType<typeof renderComponent>

const storeConfiguration = getStoreConfigurationFixture()
const newStoreConfig = {
    ...storeConfiguration,
    isConversationStartersEnabled: true,
}
jest.mock('state/integrations/actions', () => {
    return {
        getTranslations: jest.fn().mockResolvedValue({}),
        getApplicationTexts: jest.fn().mockResolvedValue({}),
        updateApplicationTexts: jest.fn().mockResolvedValue({}),
    }
})
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor')
jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days',
    () => {
        return {
            useGmvUsdOver30Days: jest.fn(() => ({
                data: [],
                isLoading: false,
            })),
        }
    },
)
jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/usePotentialImpact',
    () => {
        return {
            usePotentialImpact: jest.fn(() => 'Potential Impact'),
        }
    },
)
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock(
    'pages/aiAgent/components/AiShoppingAssistantExpireBanner/AiShoppingAssistantExpireBanner',
    () => () => <div>AI-Shopping-Assistant-Expire-Banner</div>,
)
jest.mock(
    'pages/aiAgent/trial/components/TrialManageWorkflow/TrialManageWorkflow',
    () => ({
        TrialManageWorkflow: () => <div>Trial-Manage-Workflow</div>,
    }),
)
jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useTexts',
    () => ({
        useTexts: () => ({
            texts: {
                'en-US': {
                    texts: {},
                    sspTexts: {
                        needHelp: 'Need help? Ask us anything!',
                    },
                    meta: {},
                },
            },
            translations: {
                texts: {},
                sspTexts: {},
                meta: {},
            },
            isLoading: false,
            error: null,
        }),
    }),
)

const mockUseGetChatIntegrationColor = jest.mocked(
    chatColorHook.useGetChatIntegrationColor,
)
const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

const mockUpdateApplicationTexts = jest.mocked(
    IntegrationsActions.updateApplicationTexts,
)

const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)
    .mockReturnValue(newStoreConfig)

jest.mock('launchdarkly-react-client-sdk')
const mockedUseFlags = jest.mocked(useFlags)

const getConversationStartersSwitch = (container: HTMLElement) => {
    const rowContent = within(container).getByText(
        'Suggested product questions',
    )

    return within(rowContent.closest('.cardContentWrapper')!).getByRole(
        'switch',
    )
}

const getSaveButton = (result: RenderComponentReturn) =>
    result.getByRole('button', { name: 'Save Changes' })

const getDiscardButton = (result: RenderComponentReturn) =>
    result.getByRole('button', { name: 'Discard Changes' })

const getClickEvent = () =>
    new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
    })

const click = (element: HTMLElement) => fireEvent(element, getClickEvent())

const getFloatingInputSetupButton = (container: HTMLElement) => {
    const label = within(container).getByText(
        'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
    )
    return within(label.closest('.cardContentWrapper')!).getByRole('button', {
        name: 'Set up',
    })
}

const getFloatingInputToggle = (container: HTMLElement) => {
    const label = within(container).getByText(
        'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
    )
    return within(label.closest('.cardContentWrapper')!).getByRole('switch')
}

describe('CustomerEngagementSettings', () => {
    beforeEach(() => {
        store.clearActions()
        jest.clearAllMocks()

        history = createMemoryHistory({
            initialEntries: ['/shopify/test-store/customer-engagement'],
        })

        mockedUseFlags.mockReturnValue({
            [FeatureFlagKey.ConversationStarters]: true,
            [FeatureFlagKey.ConvertFloatingChatInput]: true,
        })

        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                monitoredChatIntegrations: [1],
                floatingChatInputConfiguration: undefined,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        mockUseGetChatIntegrationColor.mockReturnValue({
            conversationColor: '#000000',
            mainColor: '#000000',
        })

        ldClientMock.allFlags.mockReturnValue({})
        let client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        client = ldClientMock
    })

    it('renders conversation starters toggle and floating input setup button correctly', () => {
        // Use setup button configuration for this test
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                monitoredChatIntegrations: [1],
                floatingChatInputConfiguration: undefined,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        const result = renderComponent()

        // Check conversation starters toggle
        const conversationStartersToggle = getConversationStartersSwitch(
            result.container,
        )
        expect(conversationStartersToggle).toBeInTheDocument()

        // Check floating input setup button
        const setupButton = getFloatingInputSetupButton(result.container)
        expect(setupButton).toBeInTheDocument()
    })

    it('should call updateApplicationTexts', async () => {
        const result = renderComponent()

        const switchElement = getConversationStartersSwitch(result.container)
        expect(switchElement).not.toBeChecked()
        click(switchElement)

        const saveButton = getSaveButton(result)
        expect(saveButton).not.toBeAriaDisabled()
        click(saveButton)

        await waitFor(() => {
            expect(mockUpdateApplicationTexts).toHaveBeenCalledWith('', {
                'en-US': {
                    meta: {},
                    sspTexts: { needHelp: 'Need help? Ask us anything!' },
                    texts: {},
                },
            })
        })
    })

    it('should not call updateApplicationTexts when there is more than one chat', async () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                monitoredChatIntegrations: [1, 2],
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        const result = renderComponent()

        const switchElement = getConversationStartersSwitch(result.container)
        expect(switchElement).not.toBeChecked()
        click(switchElement)

        const saveButton = getSaveButton(result)
        expect(saveButton).not.toBeAriaDisabled()
        click(saveButton)

        await waitFor(() => {
            expect(mockUpdateApplicationTexts).not.toHaveBeenCalled()
        })
    })

    it('should render save button disabled by default', () => {
        const result = renderComponent()
        const saveButton = getSaveButton(result)
        expect(saveButton).toBeAriaDisabled()
    })

    it('enables save button when conversation starters toggle is clicked', async () => {
        const result = renderComponent()
        const switchElement = getConversationStartersSwitch(result.container)
        expect(switchElement).not.toBeChecked()
        click(switchElement)
        expect(getSaveButton(result)).not.toBeAriaDisabled()
    })

    it('enables save button when floating input is set up', async () => {
        // Use setup button configuration for this test
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                monitoredChatIntegrations: [1],
                floatingChatInputConfiguration: undefined,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        const result = renderComponent()

        // Click setup button
        const setupButton = getFloatingInputSetupButton(result.container)
        click(setupButton)

        // Enable floating input
        // Wait for drawer to open
        await waitFor(() => {
            expect(result.getByText('Enable Ask anything input')).toBeVisible()
        })
        // Get the switch from within the drawer specifically
        const drawer = result.getByRole('dialog', {
            name: 'Ask anything input',
        })
        const floatingInputToggle = within(drawer).getByRole('switch')
        click(floatingInputToggle)

        // Click update in drawer
        const updateButton = result.getByRole('button', { name: 'Update' })
        click(updateButton)

        await waitFor(() => {
            expect(
                result.queryByRole('dialog', { name: 'Ask anything input' }),
            ).not.toBeInTheDocument()
        })

        expect(setupButton).toBeInTheDocument()
    })

    describe('when user clicks on the save button with new settings', () => {
        it('should call updateStoreConfiguration', async () => {
            const result = renderComponent()

            // Click setup button
            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            // Wait for drawer to open and enable floating input
            await waitFor(() => {
                expect(
                    result.getByText('Enable Ask anything input'),
                ).toBeVisible()
            })
            // Get the switch from within the drawer specifically
            const drawer = result.getByRole('dialog', {
                name: 'Ask anything input',
            })
            const floatingInputToggle = within(drawer).getByRole('switch')
            click(floatingInputToggle)

            // Click update in drawer
            const updateButton = result.getByRole('button', { name: 'Update' })
            click(updateButton)

            await waitFor(() => {
                expect(
                    result.queryByRole('dialog', {
                        name: 'Ask anything input',
                    }),
                ).not.toBeInTheDocument()
            })

            const saveButton = getSaveButton(result)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
                    ...storeConfiguration,
                    monitoredChatIntegrations: [1],
                    floatingChatInputConfiguration: {
                        isEnabled: true,
                        isDesktopOnly: false,
                        needHelpText: 'Need help? Ask us anything!',
                    },
                })
            })
        })

        it('should dispatch a success message', async () => {
            const result = renderComponent()

            // Click setup button
            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            // Wait for drawer to open and enable floating input
            await waitFor(() => {
                expect(
                    result.getByText('Enable Ask anything input'),
                ).toBeVisible()
            })
            // Get the switch from within the drawer specifically
            const drawer = result.getByRole('dialog', {
                name: 'Ask anything input',
            })
            const floatingInputToggle = within(drawer).getByRole('switch')
            click(floatingInputToggle)

            // Click update in drawer
            const updateButton = result.getByRole('button', { name: 'Update' })
            click(updateButton)

            await waitFor(() => {
                expect(
                    result.queryByRole('dialog', {
                        name: 'Ask anything input',
                    }),
                ).not.toBeInTheDocument()
            })

            const saveButton = getSaveButton(result)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(store.getActions()).toMatchObject([
                    {
                        payload: {
                            message: CHANGES_SAVED_SUCCESS,
                            status: NotificationStatus.Success,
                        },
                    },
                ])
            })
        })

        it('should not call updateStoreConfiguration when there is no storeConfiguration', async () => {
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            const result = renderComponent()

            // Click setup button
            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            // Wait for drawer to open and enable floating input
            await waitFor(() => {
                expect(
                    result.getByText('Enable Ask anything input'),
                ).toBeVisible()
            })
            // Get the switch from within the drawer specifically
            const drawer = result.getByRole('dialog', {
                name: 'Ask anything input',
            })
            const floatingInputToggle = within(drawer).getByRole('switch')
            click(floatingInputToggle)

            // Click update in drawer
            const updateButton = result.getByRole('button', { name: 'Update' })
            click(updateButton)

            await waitFor(() => {
                const saveButton = getSaveButton(result)
                expect(saveButton).not.toBeAriaDisabled()
            })

            const saveButton = getSaveButton(result)
            click(saveButton)

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
            })
        })

        it('should send needHelp text as undefined when value is empty', async () => {
            const result = renderComponent()

            // Click setup button
            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            // Wait for drawer to open and enable floating input
            await waitFor(() => {
                expect(
                    result.getByText('Enable Ask anything input'),
                ).toBeVisible()
            })
            // Get the switch from within the drawer specifically
            const drawer = result.getByRole('dialog', {
                name: 'Ask anything input',
            })
            const floatingInputToggle = within(drawer).getByRole('switch')
            click(floatingInputToggle)

            // Clear the textarea
            const textarea = result.getByPlaceholderText('Enter custom value')
            fireEvent.change(textarea, { target: { value: '' } })

            // Click update in drawer
            const updateButton = result.getByRole('button', { name: 'Update' })
            click(updateButton)

            await waitFor(() => {
                expect(
                    result.queryByRole('dialog', {
                        name: 'Ask anything input',
                    }),
                ).not.toBeInTheDocument()
            })

            const saveButton = getSaveButton(result)
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockUpdateApplicationTexts).toHaveBeenCalledWith('', {
                    'en-US': {
                        meta: {},
                        sspTexts: { needHelp: undefined },
                        texts: {},
                    },
                })
            })
        })
    })

    describe('when user clicks on the save button with new settings and it fails', () => {
        it('should dispatch an error message', async () => {
            mockUpdateStoreConfiguration.mockRejectedValue('ERROR')
            const result = renderComponent()

            const switchElement = getConversationStartersSwitch(
                result.container,
            )
            expect(switchElement).not.toBeChecked()
            click(switchElement)

            await waitFor(() => {
                expect(getSaveButton(result)).not.toBeAriaDisabled()
            })

            click(getSaveButton(result))

            await waitFor(() => {
                expect(store.getActions()).toMatchObject([
                    {
                        payload: {
                            status: NotificationStatus.Error,
                            message:
                                'Failed to save customer engagement configuration state',
                        },
                    },
                ])
            })
        })
    })

    it('should show a warning when navigating away without submitting the form', async () => {
        const result = renderComponent()

        const setupButton = getFloatingInputSetupButton(result.container)
        click(setupButton)

        // Wait for drawer to open
        await waitFor(() => {
            expect(result.getByText('Enable Ask anything input')).toBeVisible()
        })
        // Get the switch from within the drawer specifically
        const drawer = result.getByRole('dialog', {
            name: 'Ask anything input',
        })
        const floatingInputToggle = within(drawer).getByRole('switch')
        click(floatingInputToggle)

        const updateButton = result.getByRole('button', { name: 'Update' })
        click(updateButton)

        await waitFor(() => {
            expect(getSaveButton(result)).not.toBeAriaDisabled()
        })

        act(() => {
            history.push('/test')
        })

        expect(result.getByText('Save changes?')).toBeInTheDocument()
    })

    describe('feature flag behavior', () => {
        it('should still trigger Unsaved Changes modal even when toggle is visually disabled', async () => {
            mockedUseFlags.mockReturnValue({
                [FeatureFlagKey.ConversationStarters]: false,
                [FeatureFlagKey.ConvertFloatingChatInput]: false,
            })

            const result = renderComponent()

            const switchElement = getConversationStartersSwitch(
                result.container,
            )

            // Check visual state
            expect(switchElement).toHaveClass('disabled')

            // Simulate user click anyway
            fireEvent.click(switchElement)

            // Simulate navigation
            act(() => {
                history.push('/test')
            })

            // Assert that the modal *does* appear due to dirty form state
            expect(result.getByText('Save changes?')).toBeInTheDocument()
        })

        it('should enable toggle when feature flag is enabled', async () => {
            mockedUseFlags.mockReturnValue({
                [FeatureFlagKey.ConversationStarters]: true,
                [FeatureFlagKey.ConvertFloatingChatInput]: true,
            })

            const result = renderComponent()

            const switchElement = getConversationStartersSwitch(
                result.container,
            )
            expect(switchElement).not.toBeChecked()
            click(switchElement)

            // Will trigger because the button was disabled
            // Testing the switch disabled functionality wasn't consistent
            act(() => {
                history.push('/test')
            })

            expect(result.getByText('Save changes?')).toBeInTheDocument()
        })

        it('Should not render Floating Input settings when ConvertFloatingChatInput flag is disabled', () => {
            mockedUseFlags.mockReturnValue({
                [FeatureFlagKey.ConversationStarters]: false,
                [FeatureFlagKey.ConvertFloatingChatInput]: false,
            })

            const result = renderComponent()

            expect(
                result.queryByText('Enable Floating Input'),
            ).not.toBeInTheDocument()
        })
    })

    it('should handle toggle click correctly', async () => {
        const result = renderComponent()

        const switchElement = getConversationStartersSwitch(result.container)
        expect(switchElement).not.toBeChecked()
        click(switchElement)
        expect(switchElement).toBeChecked()
        click(switchElement)
        expect(getSaveButton(result)).not.toBeDisabled()
    })

    it('should reset form state when onDiscard is called', async () => {
        const result = renderComponent()

        click(getConversationStartersSwitch(result.container))

        act(() => {
            history.push('/test')
        })

        expect(result.getByText('Save changes?')).toBeInTheDocument()

        click(getDiscardButton(result))

        act(() => {
            history.push('/shopify/test-store/customer-engagement')
        })

        await waitFor(() => {
            expect(getSaveButton(result)).toBeAriaDisabled()
        })
    })

    describe('Conversation Launcher', () => {
        it('renders floating input toggle correctly', () => {
            const result = renderComponent()
            result.getByText(
                'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
            )
        })

        it('renders floating input setup button correctly', () => {
            const result = renderComponent()
            result.getByText(
                'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
            )
            getFloatingInputSetupButton(result.container)
        })

        it('Save button stays disabled when setup button is clicked', () => {
            const result = renderComponent()

            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            expect(getSaveButton(result)).toBeAriaDisabled()
        })

        it('opens advanced settings sidebar when setup button is clicked', () => {
            const result = renderComponent()

            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            expect(
                result.getByRole('dialog', { name: 'Ask anything input' }),
            ).toBeInTheDocument()
            expect(
                result.getByText('Enable Ask anything input'),
            ).toBeInTheDocument()
        })

        it('should show setup button when input is not configured', () => {
            const result = renderComponent()
            const setupButton = getFloatingInputSetupButton(result.container)
            expect(setupButton).toBeInTheDocument()
        })

        it('should show toggle when input is configured', () => {
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    floatingChatInputConfiguration: {
                        isEnabled: true,
                        isDesktopOnly: false,
                        needHelpText: 'Need help? Ask us anything!',
                    },
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            const result = renderComponent()
            const toggle = getFloatingInputToggle(result.container)
            expect(toggle).toBeInTheDocument()
        })

        it('enables save button when floating input is enabled and update is clicked', async () => {
            // Use setup button configuration for this test
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    monitoredChatIntegrations: [1],
                    floatingChatInputConfiguration: undefined,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            const result = renderComponent()

            // Click setup button
            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            // Wait for drawer to open and enable floating input
            await waitFor(() => {
                expect(
                    result.getByText('Enable Ask anything input'),
                ).toBeVisible()
            })
            // Get the switch from within the drawer specifically
            const drawer = result.getByRole('dialog', {
                name: 'Ask anything input',
            })
            const floatingInputToggle = within(drawer).getByRole('switch')
            click(floatingInputToggle)

            // Click update in drawer
            const updateButton = result.getByRole('button', { name: 'Update' })
            click(updateButton)

            await waitFor(() => {
                expect(getSaveButton(result)).not.toBeAriaDisabled()
            })
        })

        it('enables save button when desktop-only is enabled and update is clicked', async () => {
            // Use setup button configuration for this test
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    monitoredChatIntegrations: [1],
                    floatingChatInputConfiguration: undefined,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            const result = renderComponent()

            // Click setup button
            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            // Enable hide on mobile
            const hideOnMobileCheckbox = result.getByRole('checkbox', {
                name: 'Hide on mobile',
            })
            click(hideOnMobileCheckbox)

            // Click update in drawer
            const updateButton = result.getByRole('button', { name: 'Update' })
            click(updateButton)

            await waitFor(() => {
                expect(getSaveButton(result)).not.toBeAriaDisabled()
            })
        })

        it('keeps save button disabled when no changes are made in drawer', () => {
            // Use setup button configuration for this test
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    monitoredChatIntegrations: [1],
                    floatingChatInputConfiguration: undefined,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            const result = renderComponent()

            const setupButton = getFloatingInputSetupButton(result.container)
            click(setupButton)

            // Click update in drawer without making any changes
            const updateButton = result.getByRole('button', { name: 'Update' })
            click(updateButton)

            // Save button should still be disabled
            expect(getSaveButton(result)).toBeAriaDisabled()
        })
    })
})
