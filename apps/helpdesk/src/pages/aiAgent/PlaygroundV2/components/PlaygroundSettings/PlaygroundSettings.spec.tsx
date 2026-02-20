import type React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../../constants'
import { AIJourneyProvider } from '../../contexts/AIJourneyContext'
import { ConfigurationProvider } from '../../contexts/ConfigurationContext'
import { CoreProvider } from '../../contexts/CoreContext'
import { EventsProvider } from '../../contexts/EventsContext'
import { SettingsProvider } from '../../contexts/SettingsContext'
import { PlaygroundSettings } from './PlaygroundSettings'

const mockSetIsCollapsibleColumnOpen = jest.fn()

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
}))

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: () => ({
        setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        isCollapsibleColumnOpen: true,
    }),
}))

jest.mock('./PlaygroundSettings.less', () => ({
    playgroundSettings: 'playgroundSettings',
    settingsHeader: 'settingsHeader',
    toggleFieldsContainer: 'toggleFieldsContainer',
    settingsFooter: 'settingsFooter',
    messageInstructions: 'messageInstructions',
}))

jest.mock(
    'pages/aiAgent/PlaygroundV2/components/AIJourneySettings/AIJourneySettings',
    () => ({
        AIJourneySettings: () => <div>AI Journey Settings</div>,
    }),
)

jest.mock(
    'pages/aiAgent/PlaygroundV2/components/ChatAvailabilitySelection/ChatAvailabilitySelection',
    () => ({
        __esModule: true,
        default: ({ value, onChange }: any) => (
            <div data-testid="chat-availability-selection">
                <button onClick={() => onChange('online')}>Online</button>
                <button onClick={() => onChange('offline')}>Offline</button>
                <span data-testid="current-availability">{value}</span>
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/PlaygroundV2/components/PlaygroundActionsModal/PlaygroundActionsModal',
    () => ({
        __esModule: true,
        default: ({ isOpen, onClose, onConfirm }: any) =>
            isOpen ? (
                <div data-testid="actions-warning-modal">
                    <h2>Warning: Actions will affect real data</h2>
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={onConfirm}>Confirm</button>
                </div>
            ) : null,
    }),
)

jest.mock(
    'pages/aiAgent/PlaygroundV2/components/TargetSelection/TargetSelection',
    () => ({
        TargetSelection: ({ customer, onChange }: any) => (
            <div data-testid="target-selection">
                <span data-testid="current-customer">
                    {customer?.email || 'No customer'}
                </span>
                <button
                    onClick={() =>
                        onChange({
                            customer: { ...customer, email: 'new@test.com' },
                        })
                    }
                >
                    Change Customer
                </button>
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/PlaygroundV2/components/PlaygroundSegmentControl/PlaygroundSegmentControl',
    () => ({
        PlaygroundSegmentControl: ({
            segments,
            selectedValue,
            onValueChange,
        }: any) => (
            <div data-testid="segment-control">
                {segments.map((segment: any) => (
                    <button
                        key={segment.value}
                        onClick={() => onValueChange(segment.value)}
                        data-selected={selectedValue === segment.value}
                    >
                        {segment.label}
                    </button>
                ))}
            </div>
        ),
    }),
)

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useTestSession', () => ({
    useTestSession: () => ({
        testSessionId: 'test-session-id',
        isTestSessionLoading: false,
        createTestSession: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling', () => ({
    usePlaygroundPolling: () => ({
        testSessionLogs: undefined,
        isPolling: false,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: () => ({
        baseUrl: 'http://test.com',
        httpIntegrationId: 789,
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useShopNameResolution', () => ({
    useShopNameResolution: jest.fn((shopName?: string) => ({
        resolvedShopName: shopName || 'test-shop',
    })),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundResources', () => ({
    usePlaygroundResources: jest.fn(() => ({
        storeConfiguration: getStoreConfigurationFixture({
            storeName: 'test-store',
            monitoredChatIntegrations: [456],
        }),
        accountConfiguration: {
            httpIntegration: { id: 999 },
            gorgiasDomain: 'test-domain.gorgias.com',
            accountId: 123,
        },
        snippetHelpCenterId: 456,
        isLoading: false,
    })),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseSettingsChanged = jest.fn()
jest.mock('pages/aiAgent/PlaygroundV2/hooks/useSettingsChanged', () => ({
    useSettingsChanged: () => mockUseSettingsChanged(),
}))

jest.mock('pages/aiAgent/PlaygroundV2/contexts/MessagesContext', () => ({
    useMessagesContext: () => ({
        messages: [],
        onMessageSend: jest.fn(),
        isMessageSending: false,
        onNewConversation: jest.fn(),
        isWaitingResponse: false,
        draftMessage: '',
        draftSubject: '',
        setDraftMessage: jest.fn(),
        setDraftSubject: jest.fn(),
    }),
}))

jest.mock('@gorgias/axiom', () => ({
    Button: ({
        children,
        onClick,
        icon,
        isDisabled,
        isLoading: __isLoading,
        variant: __variant,
        ...props
    }: any) => (
        <button onClick={onClick} disabled={isDisabled} {...props}>
            {icon && <span data-icon={icon} />}
            {children}
        </button>
    ),
    ToggleField: ({ label, caption, value, onChange }: any) => (
        <div data-testid="toggle-field">
            <label>{label}</label>
            {caption && <span data-testid="toggle-caption">{caption}</span>}
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                aria-label={label}
            />
        </div>
    ),
    SelectField: ({ label, value, onChange, items, isDisabled }: any) => (
        <div data-testid="select-field">
            <label>{label}</label>
            <select
                value={value?.id}
                onChange={(e) => {
                    const selected = items.find(
                        (item: any) => item.id === e.target.value,
                    )
                    onChange(selected)
                }}
                disabled={isDisabled}
                aria-label={label}
            >
                {items.map((item: any) => (
                    <option key={item.id} value={item.id}>
                        {item.label}
                    </option>
                ))}
            </select>
        </div>
    ),
    ListItem: ({ label }: any) => label,
}))

const DEFAULT_AI_JOURNEY_CONTEXT = {
    shopifyIntegration: undefined,
    journeys: [],
    shopName: 'test-shop',
    isLoadingJourneys: false,
    followUpMessagesSent: 0,
    aiJourneySettings: {
        journeyType: 'cart-abandoned' as const,
        selectedProduct: null,
        totalFollowUp: 3,
        includeProductImage: true,
        includeDiscountCode: true,
        discountCodeValue: 10,
        discountCodeMessageIdx: 1,
        outboundMessageInstructions: '',
    },
    setAIJourneySettings: jest.fn(),
    resetAIJourneySettings: jest.fn(),
    saveAIJourneySettings: jest.fn(),
    isLoadingJourneyData: false,
    isSavingJourneyData: false,
    hasInvalidFields: false,
}

const mockResetAIJourneySettings = jest.fn()
const mockUseAIJourneyContextValue = {
    ...DEFAULT_AI_JOURNEY_CONTEXT,
    resetAIJourneySettings: mockResetAIJourneySettings,
}

jest.mock('pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext', () => ({
    ...jest.requireActual(
        'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext',
    ),
    AIJourneyProvider: ({ children }: any) => <div>{children}</div>,
    useAIJourneyContext: () => mockUseAIJourneyContextValue,
}))

const mockAIJourneyContext = (
    overrides: Partial<typeof DEFAULT_AI_JOURNEY_CONTEXT> = {},
) => {
    Object.assign(mockUseAIJourneyContextValue, {
        ...DEFAULT_AI_JOURNEY_CONTEXT,
        resetAIJourneySettings: mockResetAIJourneySettings,
        ...overrides,
    })
}

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const withProviders = (
    children: React.ReactNode,
    supportedModes?: ('inbound' | 'outbound')[],
) => (
    <Provider store={mockStore({})}>
        <QueryClientProvider client={queryClient}>
            <ConfigurationProvider>
                <AIJourneyProvider shopName="test-shop">
                    <CoreProvider>
                        <EventsProvider>
                            <SettingsProvider supportedModes={supportedModes}>
                                {children}
                            </SettingsProvider>
                        </EventsProvider>
                    </CoreProvider>
                </AIJourneyProvider>
            </ConfigurationProvider>
        </QueryClientProvider>
    </Provider>
)

const renderComponent = (supportedModes?: ('inbound' | 'outbound')[]) => {
    return render(withProviders(<PlaygroundSettings />, supportedModes))
}

describe('PlaygroundSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockResetAIJourneySettings.mockClear()
        mockUseSettingsChanged.mockReturnValue({
            hasChanged: false,
            hasInboundChanged: false,
            hasOutboundChanged: false,
            resetInitialState: jest.fn(),
        })
        mockAIJourneyContext()
    })

    describe('Header', () => {
        it('should render settings header with close button', () => {
            renderComponent()

            expect(screen.getByText('Test configuration')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /close playground panel/i }),
            ).toBeInTheDocument()
        })

        it('should call setIsCollapsibleColumnOpen when close button is clicked', async () => {
            renderComponent()

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await act(() => userEvent.click(closeButton))

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })
    })

    describe('Segment Control', () => {
        it('should render segment control with inbound and outbound options', () => {
            renderComponent()

            expect(screen.getByText('Inbound')).toBeInTheDocument()
            expect(screen.getByText('Outbound')).toBeInTheDocument()
        })

        it('should default to inbound mode', () => {
            renderComponent()

            const inboundButton = screen.getByText('Inbound')
            expect(inboundButton).toHaveAttribute('data-selected', 'true')
        })

        it('should switch to outbound mode when clicked', async () => {
            renderComponent()

            const outboundButton = screen.getByText('Outbound')

            await act(() => userEvent.click(outboundButton))

            await waitFor(() => {
                expect(
                    screen.getByText('AI Journey Settings'),
                ).toBeInTheDocument()
            })
        })

        it('should switch back to inbound mode when clicked', async () => {
            renderComponent()

            await act(() => userEvent.click(screen.getByText('Outbound')))

            await waitFor(() => {
                expect(
                    screen.getByText('AI Journey Settings'),
                ).toBeInTheDocument()
            })

            await act(() => userEvent.click(screen.getByText('Inbound')))

            await waitFor(() => {
                expect(
                    screen.queryByText('AI Journey Settings'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Inbound Settings', () => {
        it('should render channel selection with default chat option', () => {
            renderComponent()

            const channelSelect = screen.getByLabelText('Channel')
            expect(channelSelect).toHaveValue('chat')
        })

        it('should allow changing channel to email', async () => {
            renderComponent()

            const channelSelect = screen.getByLabelText('Channel')

            await act(() => userEvent.selectOptions(channelSelect, 'email'))

            await waitFor(() => {
                expect(channelSelect).toHaveValue('email')
            })
        })

        it('should allow changing channel to SMS', async () => {
            renderComponent()

            const channelSelect = screen.getByLabelText('Channel')

            await act(() => userEvent.selectOptions(channelSelect, 'sms'))

            await waitFor(() => {
                expect(channelSelect).toHaveValue('sms')
            })
        })

        it('should show chat availability selection when chat channel is selected', () => {
            renderComponent()

            expect(
                screen.getByTestId('chat-availability-selection'),
            ).toBeInTheDocument()
        })

        it('should not show chat availability selection when email channel is selected', async () => {
            renderComponent()

            const channelSelect = screen.getByLabelText('Channel')

            await act(() => userEvent.selectOptions(channelSelect, 'email'))

            await waitFor(() => {
                expect(
                    screen.queryByTestId('chat-availability-selection'),
                ).not.toBeInTheDocument()
            })
        })

        it('should show target selection with default customer', () => {
            renderComponent()

            const targetSelection = screen.getByTestId('target-selection')
            expect(targetSelection).toBeInTheDocument()
            expect(screen.getByTestId('current-customer')).toHaveTextContent(
                DEFAULT_PLAYGROUND_CUSTOMER.email,
            )
        })

        it('should allow changing customer through target selection', async () => {
            renderComponent()

            const changeButton = screen.getByText('Change Customer')

            await act(() => userEvent.click(changeButton))

            await waitFor(() => {
                expect(
                    screen.getByTestId('current-customer'),
                ).toHaveTextContent('new@test.com')
            })
        })

        it('should render actions toggle with caption', () => {
            renderComponent()

            expect(screen.getByText('Actions ⓘ')).toBeInTheDocument()
            expect(screen.getByTestId('toggle-caption')).toHaveTextContent(
                "Actions triggered in test mode will affect real customer data and can't be undone.",
            )
        })

        it('should have actions toggle disabled by default', () => {
            renderComponent()

            const actionsToggle = screen.getByLabelText('Actions ⓘ')
            expect(actionsToggle).not.toBeChecked()
        })

        it('should show warning modal when enabling actions toggle', async () => {
            renderComponent()

            const actionsToggle = screen.getByLabelText('Actions ⓘ')

            await act(() => userEvent.click(actionsToggle))

            await waitFor(() => {
                expect(
                    screen.getByTestId('actions-warning-modal'),
                ).toBeInTheDocument()
            })
        })

        it('should enable actions when confirming modal', async () => {
            renderComponent()

            const actionsToggle = screen.getByLabelText('Actions ⓘ')

            await act(() => userEvent.click(actionsToggle))

            await waitFor(() => {
                expect(
                    screen.getByTestId('actions-warning-modal'),
                ).toBeInTheDocument()
            })

            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            await act(() => userEvent.click(confirmButton))

            await waitFor(() => {
                expect(actionsToggle).toBeChecked()
                expect(
                    screen.queryByTestId('actions-warning-modal'),
                ).not.toBeInTheDocument()
            })
        })

        it('should not enable actions when canceling modal', async () => {
            renderComponent()

            const actionsToggle = screen.getByLabelText('Actions ⓘ')

            await act(() => userEvent.click(actionsToggle))

            await waitFor(() => {
                expect(
                    screen.getByTestId('actions-warning-modal'),
                ).toBeInTheDocument()
            })

            const cancelButton = screen.getByRole('button', { name: /cancel/i })
            await act(() => userEvent.click(cancelButton))

            await waitFor(() => {
                expect(actionsToggle).not.toBeChecked()
                expect(
                    screen.queryByTestId('actions-warning-modal'),
                ).not.toBeInTheDocument()
            })
        })

        it('should disable actions toggle without modal when already enabled', async () => {
            renderComponent()

            const actionsToggle = screen.getByLabelText('Actions ⓘ')

            await act(() => userEvent.click(actionsToggle))

            await waitFor(() => {
                expect(
                    screen.getByTestId('actions-warning-modal'),
                ).toBeInTheDocument()
            })

            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            await act(() => userEvent.click(confirmButton))

            await waitFor(() => {
                expect(actionsToggle).toBeChecked()
            })

            await act(() => userEvent.click(actionsToggle))

            await waitFor(() => {
                expect(actionsToggle).not.toBeChecked()
                expect(
                    screen.queryByTestId('actions-warning-modal'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Outbound Settings', () => {
        it('should render AI Journey Settings when in outbound mode', async () => {
            renderComponent()

            await act(() => userEvent.click(screen.getByText('Outbound')))

            await waitFor(() => {
                expect(
                    screen.getByText('AI Journey Settings'),
                ).toBeInTheDocument()
            })
        })

        it('should not render inbound settings when in outbound mode', async () => {
            renderComponent()

            await act(() => userEvent.click(screen.getByText('Outbound')))

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('Channel'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('chat-availability-selection'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Footer', () => {
        it('should render apply button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /apply changes/i }),
            ).toBeInTheDocument()
        })

        it('should render revert changes button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /revert changes/i }),
            ).toBeInTheDocument()
        })

        it('should have apply button disabled when no changes are made', () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: false,
                hasInboundChanged: false,
                hasOutboundChanged: false,
                resetInitialState: jest.fn(),
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).toBeDisabled()
        })

        it('should have apply button enabled when inbound settings change', () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: true,
                hasInboundChanged: true,
                hasOutboundChanged: false,
                resetInitialState: jest.fn(),
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).not.toBeDisabled()
        })

        it('should have apply button enabled when outbound settings change', async () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: true,
                hasInboundChanged: false,
                hasOutboundChanged: true,
                resetInitialState: jest.fn(),
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).not.toBeDisabled()
        })

        it('should have apply button disabled when hasInvalidFields is true', () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: true,
                hasInboundChanged: false,
                hasOutboundChanged: true,
                resetInitialState: jest.fn(),
            })
            mockAIJourneyContext({
                hasInvalidFields: true,
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).toBeDisabled()
        })

        it('should have apply button disabled when hasInvalidFields is true even if settings changed', () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: true,
                hasInboundChanged: false,
                hasOutboundChanged: true,
                resetInitialState: jest.fn(),
            })
            mockAIJourneyContext({
                hasInvalidFields: true,
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).toBeDisabled()
        })

        it('should have apply button enabled when hasInvalidFields is false and settings changed', () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: true,
                hasInboundChanged: false,
                hasOutboundChanged: true,
                resetInitialState: jest.fn(),
            })
            mockAIJourneyContext({
                hasInvalidFields: false,
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).not.toBeDisabled()
        })

        it('should have apply button disabled when both no changes and hasInvalidFields is false', () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: false,
                hasInboundChanged: false,
                hasOutboundChanged: false,
                resetInitialState: jest.fn(),
            })
            mockAIJourneyContext({
                hasInvalidFields: false,
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).toBeDisabled()
        })

        it('should have apply button disabled when no changes even if hasInvalidFields is false', () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: false,
                hasInboundChanged: false,
                hasOutboundChanged: false,
                resetInitialState: jest.fn(),
            })
            mockAIJourneyContext({
                hasInvalidFields: false,
            })

            renderComponent()

            const applyButton = screen.getByRole('button', {
                name: /apply changes/i,
            })
            expect(applyButton).toBeDisabled()
        })
    })

    describe('Chat Availability', () => {
        it('should display current chat availability', () => {
            renderComponent()

            expect(
                screen.getByTestId('current-availability'),
            ).toHaveTextContent('online')
        })

        it('should allow changing chat availability to offline', async () => {
            renderComponent()

            const offlineButton = screen.getByText('Offline')

            await act(() => userEvent.click(offlineButton))

            await waitFor(() => {
                expect(
                    screen.getByTestId('current-availability'),
                ).toHaveTextContent('offline')
            })
        })

        it('should allow changing chat availability to online', async () => {
            renderComponent()

            await act(() => userEvent.click(screen.getByText('Offline')))

            await waitFor(() => {
                expect(
                    screen.getByTestId('current-availability'),
                ).toHaveTextContent('offline')
            })

            await act(() => userEvent.click(screen.getByText('Online')))

            await waitFor(() => {
                expect(
                    screen.getByTestId('current-availability'),
                ).toHaveTextContent('online')
            })
        })
    })

    describe('Integration', () => {
        it('should maintain settings when switching between modes', async () => {
            renderComponent()

            const actionsToggle = screen.getByLabelText('Actions ⓘ')
            await act(() => userEvent.click(actionsToggle))

            await waitFor(() => {
                expect(
                    screen.getByTestId('actions-warning-modal'),
                ).toBeInTheDocument()
            })

            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            await act(() => userEvent.click(confirmButton))

            await waitFor(() => {
                expect(actionsToggle).toBeChecked()
            })

            await act(() => userEvent.click(screen.getByText('Outbound')))

            await waitFor(() => {
                expect(
                    screen.getByText('AI Journey Settings'),
                ).toBeInTheDocument()
            })

            await act(() => userEvent.click(screen.getByText('Inbound')))

            await waitFor(() => {
                expect(screen.getByLabelText('Actions ⓘ')).toBeChecked()
            })
        })

        it('should update channel and availability together', async () => {
            renderComponent()

            const channelSelect = screen.getByLabelText('Channel')
            await act(() => userEvent.selectOptions(channelSelect, 'email'))

            await waitFor(() => {
                expect(channelSelect).toHaveValue('email')
                expect(
                    screen.queryByTestId('chat-availability-selection'),
                ).not.toBeInTheDocument()
            })

            await act(() => userEvent.selectOptions(channelSelect, 'chat'))

            await waitFor(() => {
                expect(channelSelect).toHaveValue('chat')
                expect(
                    screen.getByTestId('chat-availability-selection'),
                ).toBeInTheDocument()
            })
        })

        it('should automatically change channel to sms when switching to outbound mode', async () => {
            renderComponent()

            const channelSelect = screen.getByLabelText('Channel')
            expect(channelSelect).toHaveValue('chat')

            await act(() => userEvent.click(screen.getByText('Outbound')))

            await waitFor(() => {
                expect(
                    screen.getByText('AI Journey Settings'),
                ).toBeInTheDocument()
            })

            await act(() => userEvent.click(screen.getByText('Inbound')))

            await waitFor(() => {
                const updatedChannelSelect = screen.getByLabelText('Channel')
                expect(updatedChannelSelect).toHaveValue('sms')
            })
        })
    })

    describe('Reset functionality', () => {
        it('should call resetSettings and not resetAIJourneySettings when revert button is clicked in inbound mode', async () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: true,
                hasInboundChanged: true,
                hasOutboundChanged: false,
                resetInitialState: jest.fn(),
            })

            const SettingsContext = require('../../contexts/SettingsContext')
            const resetSettingsSpy = jest.spyOn(
                SettingsContext,
                'useSettingsContext',
            )
            const mockResetSettings = jest.fn()
            resetSettingsSpy.mockReturnValue({
                ...SettingsContext.DEFAULT_STATE,
                resetSettings: mockResetSettings,
                setSettings: jest.fn(),
            })

            renderComponent()

            const revertButton = screen.getByRole('button', {
                name: /revert changes/i,
            })

            await act(() => userEvent.click(revertButton))

            expect(mockResetSettings).toHaveBeenCalled()

            expect(mockResetAIJourneySettings).not.toHaveBeenCalled()

            resetSettingsSpy.mockRestore()
        })

        it('should call resetAIJourneySettings and not resetSettings when revert button is clicked in outbound mode', async () => {
            mockUseSettingsChanged.mockReturnValue({
                hasChanged: true,
                hasInboundChanged: false,
                hasOutboundChanged: true,
                resetInitialState: jest.fn(),
            })

            const SettingsContext = require('../../contexts/SettingsContext')
            const resetSettingsSpy = jest.spyOn(
                SettingsContext,
                'useSettingsContext',
            )
            const mockResetSettings = jest.fn()
            resetSettingsSpy.mockReturnValue({
                ...SettingsContext.DEFAULT_STATE,
                mode: 'outbound',
                resetSettings: mockResetSettings,
                setSettings: jest.fn(),
            })

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('AI Journey Settings'),
                ).toBeInTheDocument()
            })

            const revertButton = screen.getByRole('button', {
                name: /revert changes/i,
            })

            await act(() => userEvent.click(revertButton))

            expect(mockResetAIJourneySettings).toHaveBeenCalled()

            expect(mockResetSettings).not.toHaveBeenCalled()

            resetSettingsSpy.mockRestore()
        })
    })

    describe('Conditional rendering with props', () => {
        const renderSettings = (props = {}) =>
            render(withProviders(<PlaygroundSettings {...props} />))

        it('should toggle footer visibility based on withFooter prop', () => {
            const { rerender } = renderSettings()
            expect(
                screen.getByRole('button', { name: /apply/i }),
            ).toBeInTheDocument()

            rerender(withProviders(<PlaygroundSettings withFooter={false} />))

            expect(
                screen.queryByRole('button', { name: /apply/i }),
            ).not.toBeInTheDocument()
        })

        it('should toggle modes switcher based on withModesSwitcher prop', () => {
            const { rerender } = renderSettings()
            expect(screen.getByText('Inbound')).toBeInTheDocument()

            rerender(
                withProviders(<PlaygroundSettings withModesSwitcher={false} />),
            )
            expect(
                screen.queryByTestId('segment-control'),
            ).not.toBeInTheDocument()
        })

        it('should call custom onClose handler when provided', async () => {
            const mockOnClose = jest.fn()
            renderSettings({ onClose: mockOnClose })

            await act(() =>
                userEvent.click(
                    screen.getByLabelText('close playground panel'),
                ),
            )

            expect(mockOnClose).toHaveBeenCalledTimes(1)
            expect(mockSetIsCollapsibleColumnOpen).not.toHaveBeenCalled()
        })

        it('should use default close handler when onClose not provided', async () => {
            renderSettings()

            await act(() =>
                userEvent.click(
                    screen.getByLabelText('close playground panel'),
                ),
            )

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })
    })

    describe('Supported Modes', () => {
        it('should hide segment control when only inbound is supported', () => {
            render(
                withProviders(<PlaygroundSettings />, ['inbound'] as (
                    | 'inbound'
                    | 'outbound'
                )[]),
            )

            expect(
                screen.queryByTestId('segment-control'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Inbound')).not.toBeInTheDocument()
            expect(screen.queryByText('Outbound')).not.toBeInTheDocument()
        })

        it('should show segment control when both modes are supported', () => {
            render(
                withProviders(<PlaygroundSettings />, [
                    'inbound',
                    'outbound',
                ] as ('inbound' | 'outbound')[]),
            )

            expect(screen.getByTestId('segment-control')).toBeInTheDocument()
            expect(screen.getByText('Inbound')).toBeInTheDocument()
            expect(screen.getByText('Outbound')).toBeInTheDocument()
        })

        it('should show segment control by default when supportedModes is not provided', () => {
            render(withProviders(<PlaygroundSettings />))

            expect(screen.getByTestId('segment-control')).toBeInTheDocument()
            expect(screen.getByText('Inbound')).toBeInTheDocument()
            expect(screen.getByText('Outbound')).toBeInTheDocument()
        })
    })
})
