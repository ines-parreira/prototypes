import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, waitFor, within } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { act } from 'react-dom/test-utils'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { LanguageChat } from 'constants/languages'
import { integrationsState } from 'fixtures/integrations'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as chatColorHook from 'pages/aiAgent/hooks/useGetChatIntegrationColor'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import type {
    Texts,
    TextsPerLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as IntegrationsActions from 'state/integrations/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { CustomerEngagementSettings } from '../CustomerEngagementSettings'

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])
const store = mockStore({ integrations: fromJS(integrationsState) })

let history = createMemoryHistory({
    initialEntries: ['/shopify/test-store/customer-engagement'],
})

const FormWrapper = ({
    children,
    onSave,
}: {
    children: ReactNode
    onSave: (data: Record<string, unknown>) => Promise<void>
}) => {
    const { storeConfiguration: currentStoreConfig } =
        mockedUseAiAgentStoreConfigurationContext()
    const methods = useForm({
        defaultValues: {
            isConversationStartersEnabled:
                currentStoreConfig?.isConversationStartersEnabled ?? false,
            isAskAnythingInputEnabled:
                currentStoreConfig?.floatingChatInputConfiguration?.isEnabled ??
                false,
            isFloatingInputDesktopOnly:
                currentStoreConfig?.floatingChatInputConfiguration
                    ?.isDesktopOnly ?? false,
            needHelpText: 'Need help? Ask us anything!',
            isSalesHelpOnSearchEnabled:
                currentStoreConfig?.isSalesHelpOnSearchEnabled ?? false,
            embeddedSpqEnabled: currentStoreConfig?.embeddedSpqEnabled ?? false,
        },
    })
    const {
        handleSubmit,
        formState: { isDirty, isSubmitting },
        reset,
    } = methods
    return (
        <FormProvider {...methods}>
            <UnsavedChangesPrompt
                onSave={handleSubmit(onSave)}
                when={isDirty}
                onDiscard={reset}
                shouldRedirectAfterSave
            />
            <button
                aria-disabled={!isDirty || isSubmitting}
                onClick={handleSubmit(onSave)}
                type="submit"
            >
                Save Changes
            </button>
            <button onClick={() => reset()} type="button">
                Discard Changes
            </button>
            {children}
        </FormProvider>
    )
}

const createOnSave = () => {
    return async (data: Record<string, unknown>) => {
        const {
            storeConfiguration: currentStoreConfig,
            updateStoreConfiguration,
        } = mockedUseAiAgentStoreConfigurationContext()

        if (currentStoreConfig) {
            try {
                await updateStoreConfiguration({
                    ...currentStoreConfig,
                    isConversationStartersEnabled:
                        data.isConversationStartersEnabled as boolean,
                    floatingChatInputConfiguration: {
                        ...currentStoreConfig?.floatingChatInputConfiguration,
                        isEnabled: data.isAskAnythingInputEnabled as boolean,
                        isDesktopOnly:
                            data.isFloatingInputDesktopOnly as boolean,
                        needHelpText:
                            (data.needHelpText as string) || undefined,
                    },
                    isSalesHelpOnSearchEnabled:
                        data.isSalesHelpOnSearchEnabled as boolean,
                })

                if (currentStoreConfig.monitoredChatIntegrations.length === 1) {
                    const { needHelpText } = data

                    const meta: Record<string, string> = {}
                    const texts: Record<string, string> = {}
                    const sspTexts: Record<string, string> = needHelpText
                        ? { needHelp: String(needHelpText) }
                        : {}

                    const textsPerLanguage: TextsPerLanguage = {
                        meta,
                        sspTexts,
                        texts,
                    }

                    const allTexts: Texts = {
                        [LanguageChat.Czech]: textsPerLanguage,
                        [LanguageChat.Danish]: textsPerLanguage,
                        [LanguageChat.Dutch]: textsPerLanguage,
                        [LanguageChat.EnglishUs]: textsPerLanguage,
                        [LanguageChat.FrenchCa]: textsPerLanguage,
                        [LanguageChat.FrenchFr]: textsPerLanguage,
                        [LanguageChat.German]: textsPerLanguage,
                        [LanguageChat.Italian]: textsPerLanguage,
                        [LanguageChat.Norwegian]: textsPerLanguage,
                        [LanguageChat.Spanish]: textsPerLanguage,
                        [LanguageChat.Swedish]: textsPerLanguage,
                        [LanguageChat.EnglishGb]: textsPerLanguage,
                        [LanguageChat.Finnish]: textsPerLanguage,
                        [LanguageChat.PortugueseBrazil]: textsPerLanguage,
                        [LanguageChat.Japanese]: textsPerLanguage,
                    }

                    await IntegrationsActions.updateApplicationTexts(
                        '',
                        allTexts,
                    )
                }

                store.dispatch({
                    type: 'notifications/notify',
                    payload: {
                        message: CHANGES_SAVED_SUCCESS,
                        status: NotificationStatus.Success,
                    },
                })
            } catch {
                store.dispatch({
                    type: 'notifications/notify',
                    payload: {
                        status: NotificationStatus.Error,
                        message:
                            'Failed to save customer engagement configuration state',
                    },
                })
            }
        }
    }
}

const renderComponent = () => {
    const onSave = createOnSave()
    return renderWithRouter(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <FormWrapper onSave={onSave}>
                    <CustomerEngagementSettings
                        primaryLanguage="en-US"
                        translations={{}}
                        onSave={onSave}
                    />
                </FormWrapper>
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/customer-engagement`,
            route: '/shopify/test-store/customer-engagement',
            history,
        },
    )
}

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
jest.mock('pages/aiAgent/hooks/useGetChatIntegrationColor')
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
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useSpqInstallationStatus',
    () => ({
        __esModule: true,
        default: jest.fn(() => ({
            isSpqInstalled: true,
            isLoaded: true,
        })),
    }),
)
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

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

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

const getConversationStartersSwitch = (container: HTMLElement) => {
    const rowContent = within(container)
        .getAllByText('AI FAQs: Floating above chat')
        .find((el) => !el.closest('[role="dialog"]'))

    return within(rowContent!.closest('.cardContentWrapper')!).getByRole(
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

const getTriggerOnSearchToggle = (container: HTMLElement) => {
    const label = within(container).getByText(
        'Send a personalized message right after a shopper searches to guide them to the right product and drive more conversions.',
    )
    return within(label.closest('.cardContentWrapper')!).getByRole('switch')
}

describe('CustomerEngagementSettings', () => {
    beforeEach(() => {
        // enabling the trigger on search switch to be able to interact and see the changes in the interface.
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TriggerOnSearchKillSwitch) {
                return false
            }

            return true
        })

        store.clearActions()
        jest.clearAllMocks()

        history = createMemoryHistory({
            initialEntries: ['/shopify/test-store/customer-engagement'],
        })

        mockUseFlag.mockImplementation((key) => {
            if (key === FeatureFlagKey.TriggerOnSearchKillSwitch) return false
            return true
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

        const switchElement = getTriggerOnSearchToggle(result.container)
        expect(switchElement).not.toBeChecked()
        click(switchElement)

        const saveButton = getSaveButton(result)
        expect(saveButton).not.toBeAriaDisabled()
        click(saveButton)

        await waitFor(() => {
            expect(mockUpdateApplicationTexts).toHaveBeenCalledWith(
                '',
                expect.objectContaining({
                    'en-US': {
                        meta: {},
                        sspTexts: { needHelp: 'Need help? Ask us anything!' },
                        texts: {},
                    },
                }),
            )
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

        const switchElement = getTriggerOnSearchToggle(result.container)
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
            const textarea = result.getByPlaceholderText('Need help?')
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
                expect(mockUpdateApplicationTexts).toHaveBeenCalledWith(
                    '',
                    expect.objectContaining({
                        'en-US': {
                            meta: {},
                            sspTexts: {},
                            texts: {},
                        },
                    }),
                )
            })
        })
    })

    describe('when user clicks on the save button with new settings and it fails', () => {
        it('should dispatch an error message', async () => {
            mockUpdateStoreConfiguration.mockRejectedValue('ERROR')
            const result = renderComponent()

            const switchElement = getTriggerOnSearchToggle(result.container)
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
        it('should trigger Unsaved Changes modal when navigating with unsaved changes', async () => {
            const result = renderComponent()

            click(getTriggerOnSearchToggle(result.container))

            act(() => {
                history.push('/test')
            })

            expect(result.getByText('Save changes?')).toBeInTheDocument()
        })

        it('should enable toggle when feature flag is enabled', async () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            const result = renderComponent()

            const switchElement = getConversationStartersSwitch(
                result.container,
            )
            expect(switchElement).not.toBeChecked()
            click(getTriggerOnSearchToggle(result.container))

            act(() => {
                history.push('/test')
            })

            expect(result.getByText('Save changes?')).toBeInTheDocument()
        })

        it('Should not render Floating Input settings when AiShoppingAssistantEnabled flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const result = renderComponent()

            expect(
                result.queryByText('Enable Floating Input'),
            ).not.toBeInTheDocument()
        })
    })

    it('should handle toggle click correctly', async () => {
        const result = renderComponent()

        const switchElement = getTriggerOnSearchToggle(result.container)
        expect(switchElement).not.toBeChecked()
        click(switchElement)
        expect(switchElement).toBeChecked()
        click(switchElement)
        expect(getSaveButton(result)).not.toBeDisabled()
    })

    it('should reset form state when onDiscard is called', async () => {
        const result = renderComponent()

        click(getTriggerOnSearchToggle(result.container))

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

    describe('Search assist', () => {
        it('should render the settings if kill switch is disabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.TriggerOnSearchKillSwitch) {
                    return false
                }

                return true
            })

            const result = renderComponent()

            const toggle = getTriggerOnSearchToggle(result.container)

            expect(toggle).toBeInTheDocument()
        })

        it('should render the settings if kill switch is enabled but feature is enabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.TriggerOnSearchKillSwitch) {
                    return true
                }

                return true
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    monitoredChatIntegrations: [1],
                    floatingChatInputConfiguration: undefined,
                    isSalesHelpOnSearchEnabled: true,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            const result = renderComponent()

            const toggle = getTriggerOnSearchToggle(result.container)

            expect(toggle).toBeInTheDocument()
            expect(toggle).toHaveClass('disabled')
        })

        it('should not render the settings if kill switch is enabled and feature is disabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.TriggerOnSearchKillSwitch) {
                    return true
                }

                return true
            })

            const result = renderComponent()

            expect(
                within(result.container).queryByText('Search assist'),
            ).not.toBeInTheDocument()
        })
    })
})
