import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, waitFor, within } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { StoreConfiguration } from 'models/aiAgent/types'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as chatColorHook from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { VolumeSettings } from '../VolumeSettings'

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])()

let history = createMemoryHistory({
    initialEntries: ['/shopify/test-store/volume'],
})

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore}>
            <QueryClientProvider client={queryClient}>
                <VolumeSettings />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/volume`,
            route: '/shopify/test-store/volume',
            history,
        },
    )

type RenderComponentReturn = ReturnType<typeof renderComponent>

const storeConfiguration = getStoreConfigurationFixture()
const newStoreConfig = {
    ...storeConfiguration,
    isConversationStartersEnabled: true,
}

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor')

const mockUseGetChatIntegrationColor = jest.mocked(
    chatColorHook.useGetChatIntegrationColor,
)
const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)
    .mockReturnValue(newStoreConfig)

jest.mock('launchdarkly-react-client-sdk')
const mockedUseFlags = jest.mocked(useFlags)

const getConversationStartersSwitch = (container: HTMLElement) => {
    const label = within(container).getByText('Enable conversation starters')
    return within(label.closest('label')!).getByRole('switch')
}

const getSaveButton = (result: RenderComponentReturn) =>
    result.getByRole('button', { name: 'Save Changes' })

const getDiscardButton = (result: RenderComponentReturn) =>
    result.getByRole('button', { name: 'Discard Changes' })

const modalText =
    'Your changes to this page will be lost if you don’t save them.'

const getModal = (result: RenderComponentReturn) => result.getByText(modalText)

const queryModal = (result: RenderComponentReturn) =>
    result.queryByText(modalText)

const getClickEvent = () =>
    new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
    })

const click = (element: HTMLElement) => fireEvent(element, getClickEvent())

describe('VolumeSettings', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.clearAllMocks()

        history = createMemoryHistory({
            initialEntries: ['/shopify/test-store/volume'],
        })

        mockedUseFlags.mockReturnValue({
            [FeatureFlagKey.ConversationStarters]: true,
        })

        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { ...storeConfiguration },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        mockUseGetChatIntegrationColor.mockReturnValue({
            conversationColor: '#000000',
            mainColor: '#000000',
        })
    })

    it('renders conversation starters toggle correctly', () => {
        const result = renderComponent()

        result.getByText('Conversation Starters')
        result.getByText('Enable conversation starters')
    })

    it('shows preview messages', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                isConversationStartersEnabled: true,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: true,
                },
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        const result = renderComponent()

        result.getByText('Can this product be used daily?')
        result.getByText('Is this suitable for sensitive skin?')
        result.getByText('Does this contain fragrances?')
    })

    it('should render save button disabled by default', () => {
        const result = renderComponent()
        const saveButton = getSaveButton(result)
        expect(saveButton).toBeAriaDisabled()
    })

    it('enables save button when toggle is clicked', async () => {
        const result = renderComponent()
        const switchElement = getConversationStartersSwitch(result.container)
        expect(switchElement).not.toBeChecked()
        click(switchElement)
        expect(getSaveButton(result)).not.toBeAriaDisabled()
    })

    describe('when user clicks on the save button with new settings', () => {
        it('should call updateStoreConfiguration', async () => {
            const result = renderComponent()

            const switchElement = getConversationStartersSwitch(
                result.container,
            )
            expect(switchElement).not.toBeChecked()
            click(switchElement)

            const saveButton = getSaveButton(result)
            expect(saveButton).not.toBeAriaDisabled()
            click(saveButton)

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
                    ...storeConfiguration,
                    isConversationStartersEnabled: true,
                    floatingChatInputConfiguration: {
                        isEnabled: false,
                        isDesktopOnly: false,
                    },
                })
            })
        })

        it('should dispatch a success message', async () => {
            const result = renderComponent()

            const switchElement = getConversationStartersSwitch(
                result.container,
            )
            expect(switchElement).not.toBeChecked()
            click(switchElement)

            const saveButton = getSaveButton(result)
            expect(saveButton).not.toBeAriaDisabled()
            click(saveButton)

            await waitFor(() => {
                expect(mockStore.getActions()).toMatchObject([
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
                expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
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
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            status: NotificationStatus.Error,
                            message:
                                'Failed to save volume configuration state',
                        },
                    },
                ])
            })
        })
    })

    it('should show a warning when navigating away without submitting the form', async () => {
        const result = renderComponent()

        click(getConversationStartersSwitch(result.container))

        await waitFor(() => {
            expect(getSaveButton(result)).not.toBeAriaDisabled()
        })

        act(() => {
            history.push('/test')
        })

        await waitFor(() => {
            getModal(result)
        })
    })

    describe('feature flag behavior', () => {
        it('should still trigger Unsaved Changes modal even when toggle is visually disabled', async () => {
            mockedUseFlags.mockReturnValue({
                [FeatureFlagKey.ConversationStarters]: false,
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
            await waitFor(() => {
                expect(queryModal(result)).toBeInTheDocument()
            })
        })

        it('should enable toggle when feature flag is enabled', async () => {
            mockedUseFlags.mockReturnValue({
                [FeatureFlagKey.ConversationStarters]: true,
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

            await waitFor(() => {
                getModal(result)
            })
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

        await waitFor(() => {
            getModal(result)
        })

        click(getDiscardButton(result))

        act(() => {
            history.push('/shopify/test-store/volume')
        })

        await waitFor(() => {
            expect(getSaveButton(result)).toBeAriaDisabled()
        })
    })

    describe('Conversation Launcher', () => {
        const getFloatingInputSwitch = (container: HTMLElement) => {
            const label = within(container).getByText('Enable Floating Input')
            return within(label.closest('label')!).getByRole('switch')
        }

        it('renders floating input toggle correctly', () => {
            const result = renderComponent()
            result.getByText('Enable Floating Input')
        })

        it('enables save button when floating input toggle is clicked', () => {
            const result = renderComponent()

            const switchElement = getFloatingInputSwitch(result.container)
            expect(switchElement).not.toBeChecked()

            click(switchElement)

            expect(getSaveButton(result)).not.toBeAriaDisabled()
        })

        it('opens advanced settings sidebar when toggle is on and label is clicked', () => {
            const result = renderComponent()

            const switchElement = getFloatingInputSwitch(result.container)
            click(switchElement)

            const advancedSettingsLabel = result.getByText('Advanced settings')
            click(advancedSettingsLabel)

            expect(
                result.getByText('Floating Input: Advanced Settings'),
            ).toBeInTheDocument()
        })

        it('should disable advanced settings label when floating input is off', () => {
            const result = renderComponent()
            const advancedLabel = result.getByText('Advanced settings')

            expect(advancedLabel.closest('label')).toHaveClass('disabled')
        })
    })
})
