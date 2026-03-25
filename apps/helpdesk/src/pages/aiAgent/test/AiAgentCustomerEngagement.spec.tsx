// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { SegmentEvent } from '@repo/logging'
import { userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as chatColorHook from 'pages/aiAgent/hooks/useGetChatIntegrationColor'
import * as contextHook from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentCustomerEngagement } from '../AiAgentCustomerEngagement'
import { SALES } from '../constants'

const mockLogEvent = jest.fn()
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: (...args: unknown[]) => mockLogEvent(...args),
}))

jest.mock('pages/aiAgent/hooks/useGetChatIntegrationColor')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock(
    'pages/aiAgent/components/AiShoppingAssistantExpireBanner/AiShoppingAssistantExpireBanner',
    () => () => <div>AI-Shopping-Assistant-Expire-Banner</div>,
)

const mockUpdateApplicationTexts = jest.fn().mockResolvedValue({})
jest.mock('state/integrations/actions', () => {
    return {
        getTranslations: jest.fn().mockResolvedValue({}),
        getApplicationTexts: jest.fn().mockResolvedValue({}),
        updateApplicationTexts: (...args: unknown[]) =>
            mockUpdateApplicationTexts(...args),
    }
})

const mockUseTexts = jest.fn().mockReturnValue({
    texts: {
        'en-US': {
            texts: {},
            sspTexts: {
                needHelp: 'Need help?',
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
})

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useTexts',
    () => ({
        useTexts: (...args: unknown[]) => mockUseTexts(...args),
    }),
)

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/CustomerEngagementSettings',
    () => ({
        CustomerEngagementSettings: ({
            onSave,
        }: {
            onSave: (data: Record<string, unknown>) => Promise<void>
        }) => (
            <div data-testid="customer-engagement-settings">
                <button
                    data-testid="trigger-save"
                    onClick={() =>
                        onSave({
                            isConversationStartersEnabled: true,
                            isConversationStartersDesktopOnly: false,
                            isAskAnythingInputEnabled: true,
                            isFloatingInputDesktopOnly: false,
                            isSalesHelpOnSearchEnabled: true,
                            needHelpText: 'Updated help text',
                            embeddedSpqEnabled: true,
                        })
                    }
                >
                    Trigger Save
                </button>
            </div>
        ),
    }),
)

const mockUseGetChatIntegrationColor = jest.mocked(
    chatColorHook.useGetChatIntegrationColor,
)
const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    contextHook.useAiAgentStoreConfigurationContext,
)

const queryClient = mockQueryClient()

const defaultState = {
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

const stateWithIntegrations = {
    integrations: toImmutable({
        integrations: [
            {
                type: 'gorgias_chat',
                name: 'test-store',
                meta: {
                    app_id: 'test-app-id',
                    shop_name: 'test-store',
                    default_language: 'en-US',
                },
            },
        ],
    }),
    billing: toImmutable({
        products: [],
    }),
}

const renderComponent = (state = defaultState) =>
    renderWithRouter(
        <Provider store={mockStore(state)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentCustomerEngagement />
            </QueryClientProvider>
        </Provider>,
        {
            path: '/app/ai-agent/:shopType/:shopName/sales/engagement',
            route: '/app/ai-agent/shopify/test-store/sales/engagement',
        },
    )

describe('<AiAgentCustomerEngagement />', () => {
    const mockUpdateStoreConfiguration = jest.fn()
    const mockCreateStoreConfiguration = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...getStoreConfigurationFixture(),
                storeName: 'test-store',
                monitoredChatIntegrations: [1],
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isPendingCreateOrUpdate: false,
        })

        mockUseGetChatIntegrationColor.mockReturnValue({
            conversationColor: '#000000',
            mainColor: '#000000',
        })

        mockUpdateStoreConfiguration.mockResolvedValue({})
    })

    it('should render the customer engagement settings', () => {
        renderComponent()
        expect(
            screen.getByRole('heading', { level: 1, name: SALES }),
        ).toBeInTheDocument()
    })

    it('should render the save button as disabled initially', () => {
        renderComponent()
        const saveButton = screen.getByRole('button', { name: /save changes/i })
        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should track page view on mount', () => {
        renderComponent()
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentShoppingAssistantCustomerEngagementViewed,
            expect.objectContaining({ shopName: 'test-store' }),
        )
    })

    describe('onSave', () => {
        it('should save successfully and update application texts when canUpdateTexts is true', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        isConversationStartersEnabled: true,
                        isConversationStartersDesktopOnly: false,
                        isSalesHelpOnSearchEnabled: true,
                        embeddedSpqEnabled: true,
                        floatingChatInputConfiguration: expect.objectContaining(
                            {
                                isEnabled: true,
                                isDesktopOnly: false,
                                needHelpText: 'Updated help text',
                            },
                        ),
                    }),
                )
            })

            await waitFor(() => {
                expect(mockUpdateApplicationTexts).toHaveBeenCalledWith(
                    '',
                    expect.objectContaining({
                        'en-US': expect.objectContaining({
                            sspTexts: expect.objectContaining({
                                needHelp: 'Updated help text',
                            }),
                        }),
                    }),
                )
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentShoppingAssistantCustomerEngagementUpdated,
                    expect.objectContaining({
                        customerEngagementSetting: {
                            triggerOnSearch: 'on',
                            suggestedProductQuestion: 'on',
                            askAnythingInput: 'on',
                        },
                    }),
                )
            })
        })

        it('should save successfully without updating texts when canUpdateTexts is false', async () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...getStoreConfigurationFixture(),
                    storeName: 'test-store',
                    monitoredChatIntegrations: [1, 2],
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            })

            expect(mockUpdateApplicationTexts).not.toHaveBeenCalled()
        })

        it('should show error notification when save fails', async () => {
            mockUpdateStoreConfiguration.mockRejectedValue(
                new Error('Save failed'),
            )

            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            })

            expect(mockLogEvent).not.toHaveBeenCalledWith(
                SegmentEvent.AiAgentShoppingAssistantCustomerEngagementUpdated,
                expect.anything(),
            )
        })

        it('should not save when storeConfiguration is null', async () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        })

        it('should handle empty needHelpText', async () => {
            jest.doMock(
                'pages/aiAgent/components/CustomerEngagementSettings/CustomerEngagementSettings',
                () => ({
                    CustomerEngagementSettings: ({
                        onSave,
                    }: {
                        onSave: (data: Record<string, unknown>) => Promise<void>
                    }) => (
                        <div data-testid="customer-engagement-settings">
                            <button
                                data-testid="trigger-save-empty"
                                onClick={() =>
                                    onSave({
                                        isConversationStartersEnabled: false,
                                        isConversationStartersDesktopOnly: false,
                                        isAskAnythingInputEnabled: false,
                                        isFloatingInputDesktopOnly: false,
                                        isSalesHelpOnSearchEnabled: false,
                                        needHelpText: '',
                                        embeddedSpqEnabled: false,
                                    })
                                }
                            >
                                Trigger Save Empty
                            </button>
                        </div>
                    ),
                }),
            )

            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            })
        })
    })

    describe('tracking events', () => {
        it('should track customer engagement updated with off values', async () => {
            jest.isolateModules(() => {
                jest.doMock(
                    'pages/aiAgent/components/CustomerEngagementSettings/CustomerEngagementSettings',
                    () => ({
                        CustomerEngagementSettings: ({
                            onSave,
                        }: {
                            onSave: (
                                data: Record<string, unknown>,
                            ) => Promise<void>
                        }) => (
                            <button
                                data-testid="trigger-save-off"
                                onClick={() =>
                                    onSave({
                                        isConversationStartersEnabled: false,
                                        isConversationStartersDesktopOnly: false,
                                        isAskAnythingInputEnabled: false,
                                        isFloatingInputDesktopOnly: false,
                                        isSalesHelpOnSearchEnabled: false,
                                        needHelpText: '',
                                        embeddedSpqEnabled: false,
                                    })
                                }
                            >
                                Save Off
                            </button>
                        ),
                    }),
                )
            })

            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            })
        })
    })

    describe('edge cases', () => {
        it('should handle storeConfiguration with undefined floatingChatInputConfiguration', async () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...getStoreConfigurationFixture(),
                    storeName: 'test-store',
                    monitoredChatIntegrations: [1],
                    floatingChatInputConfiguration: undefined,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        floatingChatInputConfiguration: expect.objectContaining(
                            {
                                isEnabled: true,
                                isDesktopOnly: false,
                            },
                        ),
                    }),
                )
            })
        })

        it('should render correctly when storeConfiguration is loading', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: true,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent()
            expect(
                screen.getByRole('heading', { level: 1, name: SALES }),
            ).toBeInTheDocument()
        })

        it('should handle save button click via handleSubmit', async () => {
            const user = userEvent.setup()
            renderComponent()

            const saveButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            })
        })

        it('should render with gorgias chat integrations', async () => {
            const user = userEvent.setup()
            renderComponent(stateWithIntegrations)

            expect(
                screen.getByRole('heading', { level: 1, name: SALES }),
            ).toBeInTheDocument()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            })

            await waitFor(() => {
                expect(mockUpdateApplicationTexts).toHaveBeenCalledWith(
                    'test-app-id',
                    expect.anything(),
                )
            })
        })

        it('should handle storeConfiguration with all boolean flags true', async () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...getStoreConfigurationFixture(),
                    storeName: 'test-store',
                    monitoredChatIntegrations: [1],
                    isConversationStartersEnabled: true,
                    isSalesHelpOnSearchEnabled: true,
                    embeddedSpqEnabled: true,
                    floatingChatInputConfiguration: {
                        isEnabled: true,
                        isDesktopOnly: true,
                        needHelpText: 'Existing help text',
                    },
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: mockCreateStoreConfiguration,
                isPendingCreateOrUpdate: false,
            })

            renderComponent()
            expect(
                screen.getByRole('heading', { level: 1, name: SALES }),
            ).toBeInTheDocument()
        })

        it('should handle empty needHelp text from useTexts', async () => {
            mockUseTexts.mockReturnValueOnce({
                texts: {
                    'en-US': {
                        texts: {},
                        sspTexts: {},
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
            })

            const user = userEvent.setup()
            renderComponent()

            expect(
                screen.getByRole('heading', { level: 1, name: SALES }),
            ).toBeInTheDocument()

            await act(() => user.click(screen.getByTestId('trigger-save')))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
            })
        })
    })
})
