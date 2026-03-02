import type { ReactNode } from 'react'

import { getLDClient } from '@repo/feature-flags'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationsState } from 'fixtures/integrations'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import {
    ConversationLauncherAdvancedSettings,
    ConversationLauncherSettings,
} from '../ConversationLauncherSettings'

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/usePotentialImpact',
    () => {
        return {
            usePotentialImpact: jest.fn(
                (coefficient: number) =>
                    `Unlock up to ${coefficient}% additional GMV`,
            ),
        }
    },
)

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            analytics: '/analytics',
        },
    }),
}))

const mockStoreConfigurationWithOneChat = getStoreConfigurationFixture({
    monitoredChatIntegrations: [1234],
})

const mockStoreConfigurationWithMultipleChats = getStoreConfigurationFixture({
    monitoredChatIntegrations: [1234, 4567, 7890],
})

const mockTranslations = {
    texts: {},
    sspTexts: {},
    meta: {},
}

const mockStore = configureStore([thunk])
const store = mockStore({ integrations: fromJS(integrationsState) })

const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

type FormValues = {
    isAskAnythingInputEnabled?: boolean
    isFloatingInputDesktopOnly?: boolean
    isAskAnythingInputSetUp?: boolean
    needHelpText?: string
}

const Wrapper = ({
    children,
    defaultValues = {
        isAskAnythingInputEnabled: false,
        isFloatingInputDesktopOnly: false,
        isAskAnythingInputSetUp: false,
        needHelpText: '',
    },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })

    return (
        <Provider store={store}>
            <MemoryRouter>
                <FormProvider {...methods}>{children}</FormProvider>
            </MemoryRouter>
        </Provider>
    )
}

describe('ConversationLauncherSettings', () => {
    const getCardTitle = () => {
        return screen.getAllByText('Ask anything input')[0]
    }

    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
        let __client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __client = ldClientMock

        // Default mock - shows setup button (no floatingChatInputConfiguration)
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: undefined,
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
    })

    it('renders the main Ask anything input title', () => {
        render(
            <Wrapper>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(getCardTitle()).toBeInTheDocument()
        expect(
            screen.getByText('Unlock up to 0.05% additional GMV'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByAltText(
                'image showing an example of the Ask anything input',
            ),
        ).toBeInTheDocument()
    })

    it('shows Set up button when not set up', () => {
        render(
            <Wrapper>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Set up')).toBeInTheDocument()
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('shows toggle when set up', () => {
        // Mock with configured floatingChatInputConfiguration to show toggle
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: true,
                    isFloatingInputDesktopOnly: false,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.queryByText('Set up')).not.toBeInTheDocument()
    })

    it('opens drawer when Set up button is clicked', () => {
        render(
            <Wrapper>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Set up'))

        expect(screen.getByText('Enable Ask anything input')).toBeVisible()
    })

    it('opens drawer when toggle is clicked and feature is disabled', () => {
        // Mock with configured floatingChatInputConfiguration to show toggle
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: false,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: false,
                    isFloatingInputDesktopOnly: false,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByRole('switch'))

        expect(screen.getByText('Enable Ask anything input')).toBeVisible()
    })

    it('calls onAdvancedSettingsSave and closes advanced settings when updating Advanced settings', () => {
        const mockOnAdvancedSettingsSave = jest.fn()

        render(
            <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                    onAdvancedSettingsSave={mockOnAdvancedSettingsSave}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Set up'))

        // Wait for drawer to open and click the switch
        const drawer = screen.getByRole('dialog', {
            name: 'Ask anything input',
        })
        const toggleSwitch = within(drawer).getByRole('switch')
        fireEvent.click(toggleSwitch)

        fireEvent.click(screen.getByText('Update'))

        expect(mockOnAdvancedSettingsSave).toHaveBeenCalled()
    })

    it('shows the settings gear icon when ask anything input is setup', () => {
        // Mock with configured floatingChatInputConfiguration to show toggle
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: true,
                    isFloatingInputDesktopOnly: false,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(
            screen.getByRole('button', { name: 'Open settings' }),
        ).toBeInTheDocument()
    })

    it('opens drawer when settings icon is clicked', () => {
        // Mock with configured floatingChatInputConfiguration to show toggle
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: true,
                    isFloatingInputDesktopOnly: false,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        const settingsButton = screen.getByRole('button', {
            name: 'Open settings',
        })
        fireEvent.click(settingsButton)

        expect(screen.getByText('Enable Ask anything input')).toBeVisible()
    })

    it('does not show desktop only badge when feature is enabled for all devices', () => {
        // Mock with configured floatingChatInputConfiguration to show toggle
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: true,
                    isFloatingInputDesktopOnly: false,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.queryByText('Desktop only')).not.toBeInTheDocument()
    })

    it('shows only desktop badge when feature is desktop only', () => {
        // Mock with configured floatingChatInputConfiguration to show toggle
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: true,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: true,
                    isFloatingInputDesktopOnly: true,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.queryByText('Mobile')).not.toBeInTheDocument()
        expect(screen.getByText('Desktop only')).toBeInTheDocument()
    })

    it('disables the feature when toggle is clicked while enabled', () => {
        const mockSetValue = jest.fn()

        // Mock with configured floatingChatInputConfiguration to show toggle
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        const MockFormWrapper = ({ children }: { children: ReactNode }) => {
            const methods = useForm<FormValues>({
                defaultValues: {
                    isAskAnythingInputEnabled: true,
                    isFloatingInputDesktopOnly: false,
                },
            })
            methods.setValue = mockSetValue
            return (
                <Provider store={store}>
                    <MemoryRouter>
                        <FormProvider {...methods}>{children}</FormProvider>
                    </MemoryRouter>
                </Provider>
            )
        }

        render(
            <MockFormWrapper>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </MockFormWrapper>,
        )

        const toggle = screen.getByRole('switch')
        fireEvent.click(toggle)

        expect(mockSetValue).toHaveBeenCalledWith(
            'isAskAnythingInputEnabled',
            false,
            {
                shouldDirty: true,
            },
        )
        expect(mockSetValue).toHaveBeenCalledWith(
            'isFloatingInputDesktopOnly',
            false,
            {
                shouldDirty: true,
            },
        )
    })

    it('shows Track Performance link when feature is enabled', () => {
        // Mock with configured floatingChatInputConfiguration with isEnabled true
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: true,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: true,
                    isFloatingInputDesktopOnly: false,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Track Performance')).toBeInTheDocument()
    })

    it('does not show Track Performance link when feature is disabled', () => {
        // Mock with configured floatingChatInputConfiguration with isEnabled false
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfigurationWithOneChat,
                floatingChatInputConfiguration: {
                    isEnabled: false,
                    isDesktopOnly: false,
                    needHelpText: 'Need help?',
                },
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        render(
            <Wrapper
                defaultValues={{
                    isAskAnythingInputEnabled: false,
                    isFloatingInputDesktopOnly: false,
                }}
            >
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.queryByText('Track Performance')).not.toBeInTheDocument()
    })

    describe('ConversationLauncherAdvancedSettings', () => {
        const mockOnClose = jest.fn()
        const mockOnSave = jest.fn()

        beforeEach(() => {
            mockOnClose.mockClear()
            mockOnSave.mockClear()
        })

        it('renders with slide out animation class when isOpen is false', () => {
            const { container } = render(
                <Wrapper>
                    <ConversationLauncherAdvancedSettings
                        isOpen={false}
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            const drawer = container.querySelector('[class="drawer"]')
            expect(drawer).not.toHaveClass('opened')
            expect(drawer).not.toBeVisible()
        })

        it('renders toggles and buttons when open', () => {
            render(
                <Wrapper
                    defaultValues={{
                        isFloatingInputDesktopOnly: false,
                        isAskAnythingInputEnabled: false,
                    }}
                >
                    <ConversationLauncherAdvancedSettings
                        isOpen
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            expect(
                screen.getByText('Enable Ask anything input'),
            ).toBeInTheDocument()
            expect(screen.getByText('Hide on mobile')).toBeInTheDocument()
            expect(screen.getAllByRole('switch')).toHaveLength(1)
            expect(
                screen.getByRole('checkbox', { name: 'Hide on mobile' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).toHaveAttribute('aria-disabled', 'true')
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).not.toBeDisabled()
        })

        it('should not render placeholder customization when store has more than one associated chat', () => {
            render(
                <Wrapper
                    defaultValues={{
                        isFloatingInputDesktopOnly: false,
                        isAskAnythingInputEnabled: false,
                    }}
                >
                    <ConversationLauncherAdvancedSettings
                        isOpen
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        storeConfiguration={
                            mockStoreConfigurationWithMultipleChats
                        }
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            expect(
                screen.queryByText('Customize placeholder text'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByPlaceholderText('Enter custom value'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Update' }),
            ).toHaveAttribute('aria-disabled', 'true')
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).not.toBeDisabled()
        })

        it('should render placeholder customization when store has only one associated chat', () => {
            render(
                <Wrapper
                    defaultValues={{
                        isFloatingInputDesktopOnly: false,
                        isAskAnythingInputEnabled: false,
                    }}
                >
                    <ConversationLauncherAdvancedSettings
                        isOpen
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        storeConfiguration={mockStoreConfigurationWithOneChat}
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            expect(
                screen.getByText('Placeholder text', { selector: 'div' }),
            ).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Need help?'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).toHaveAttribute('aria-disabled', 'true')
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).not.toBeDisabled()
        })

        it('enables Update button when main toggle changes', () => {
            render(
                <Wrapper
                    defaultValues={{
                        isFloatingInputDesktopOnly: false,
                        isAskAnythingInputEnabled: false,
                    }}
                >
                    <ConversationLauncherAdvancedSettings
                        isOpen
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            const mainToggle = screen.getByRole('switch')
            fireEvent.click(mainToggle)

            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).not.toBeDisabled()
        })

        it('enables Update button when hide on mobile checkbox changes', () => {
            render(
                <Wrapper
                    defaultValues={{
                        isFloatingInputDesktopOnly: false,
                        isAskAnythingInputEnabled: false,
                    }}
                >
                    <ConversationLauncherAdvancedSettings
                        isOpen
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            const hideOnMobileCheckbox = screen.getByRole('checkbox', {
                name: 'Hide on mobile',
            })
            fireEvent.click(hideOnMobileCheckbox)

            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).not.toBeDisabled()
        })

        it('enables Update button when placeholder is different than initial value', async () => {
            render(
                <Wrapper
                    defaultValues={{
                        isFloatingInputDesktopOnly: false,
                        isAskAnythingInputEnabled: false,
                    }}
                >
                    <ConversationLauncherAdvancedSettings
                        isOpen
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        storeConfiguration={mockStoreConfigurationWithOneChat}
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            const placeholderInput = screen.getByPlaceholderText('Need help?')
            fireEvent.change(placeholderInput, {
                target: { value: 'New placeholder' },
            })
            fireEvent.blur(placeholderInput)

            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).not.toBeDisabled()
        })

        it('calls onSave and setValue on update', () => {
            render(
                <Wrapper
                    defaultValues={{
                        isFloatingInputDesktopOnly: false,
                        isAskAnythingInputEnabled: false,
                    }}
                >
                    <ConversationLauncherAdvancedSettings
                        isOpen
                        onClose={mockOnClose}
                        onSave={mockOnSave}
                        primaryLanguage="en-US"
                        translations={mockTranslations}
                    />
                </Wrapper>,
            )

            const mainToggle = screen.getByRole('switch')
            fireEvent.click(mainToggle)
            fireEvent.click(screen.getByRole('button', { name: 'Update' }))

            expect(mockOnSave).toHaveBeenCalled()
        })
    })
})
