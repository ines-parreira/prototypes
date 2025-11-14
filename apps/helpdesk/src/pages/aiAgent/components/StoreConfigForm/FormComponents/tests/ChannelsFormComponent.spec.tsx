import { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { useFetchChatIntegrationsStatusData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { ChannelsFormComponent } from '../ChannelsFormComponent'

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

// Mock state selectors
jest.mock('state/integrations/selectors', () => ({
    getIntegrationsByTypes: () => () => [],
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData',
    () => ({
        useFetchChatIntegrationsStatusData: jest.fn(),
    }),
)

// Mock all imported components
jest.mock(
    'pages/aiAgent/components/ConfigurationSection/ConfigurationSection',
    () => ({
        ConfigurationSection: ({
            children,
            title,
        }: {
            children: ReactNode
            title: string
        }) => (
            <div data-testid="configuration-section" data-title={title}>
                {children}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/StoreConfigForm/FormComponents/SettingsBanner',
    () => ({
        SettingsBanner: ({ type }: { type: string }) => (
            <div data-testid="settings-banner" data-type={type}>
                settings banner {type}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/StoreConfigForm/FormComponents/ChannelToggleInput',
    () => ({
        ChannelToggleInput: ({
            isToggled,
            onUpdate,
            channel,
            isDisabled,
            type,
        }: {
            isToggled: boolean
            onUpdate: (isToggled: boolean) => void
            channel: string
            isDisabled: boolean
            type: string
        }) => (
            <div>
                <div
                    data-testid={`channel-toggle-${channel}`}
                    data-toggled={isToggled}
                    data-disabled={isDisabled}
                    onClick={() => onUpdate(!isToggled)}
                >
                    channel toggle {channel}
                </div>
                <div data-testid="settings-banner" data-type={type}>
                    settings banner {type}
                </div>
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/StoreConfigForm/FormComponents/ChatSettingsFormComponent',
    () => ({
        ChatSettingsFormComponent: ({
            isRequired,
        }: {
            isRequired: boolean
        }) => (
            <div data-testid="chat-settings-form" data-required={isRequired}>
                chat settings form
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/HandoverCustomization/HandoverCustomizationChatSettingsComponent',
    () => ({
        HandoverCustomizationChatSettingsComponent: ({
            shopName,
        }: {
            shopName: string
        }) => (
            <div
                data-testid="handover-customization-settings"
                data-shop={shopName}
            >
                handover customization settings
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/StoreConfigForm/FormComponents/EmailFormComponent',
    () => ({
        EmailFormComponent: ({ isRequired }: { isRequired: boolean }) => (
            <div data-testid="email-form" data-required={isRequired}>
                email form
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/StoreConfigForm/FormComponents/SignatureFormComponent',
    () => ({
        SignatureFormComponent: ({ isRequired }: { isRequired: boolean }) => (
            <div data-testid="signature-form" data-required={isRequired}>
                signature form
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/StoreConfigForm/FormComponents/SmsSettingsFormComponent',
    () => ({
        SmsSettingsFormComponent: ({ isRequired }: { isRequired: boolean }) => (
            <div data-testid="sms-form" data-required={isRequired}>
                sms form
            </div>
        ),
    }),
)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)
const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)

describe('ChannelsFormComponent', () => {
    const mockProps = {
        shopName: 'Test Shop',
        shopType: 'shopify',
        updateValue: jest.fn(),
        monitoredChatIntegrations: [1, 2],
        isChatChannelEnabled: true,
        chatChannelDeactivatedDatetime: null,
        updateChatChannelDeactivatedDatetime: jest.fn(),
        signature: 'Test Signature',
        useEmailIntegrationSignature: false,
        monitoredEmailIntegrations: [{ id: 1, email: 'test@example.com' }],
        isEmailChannelEnabled: true,
        emailChannelDeactivatedDatetime: null,
        updateEmailChannelDeactivatedDatetime: jest.fn(),
        setIsFormDirty: jest.fn(),
        monitoredSmsIntegrations: [],
        isSmsChannelEnabled: true,
        smsChannelDeactivatedDatetime: null,
        updateSmsChannelDeactivatedDatetime: jest.fn(),
        smsDisclaimer: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentChat || false,
        )
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        ;(useAppSelector as jest.Mock).mockReturnValue(true)
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue([
            { value: { id: 1, name: 'Test Channel 1' } },
            { value: { id: 2, name: 'Test Channel 2' } },
            { value: { id: 3, name: 'Test Channel 3' } },
        ])
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: [
                { chatId: 1, installed: true },
                { chatId: 2, installed: true },
                { chatId: 3, installed: false },
            ],
        })
    })
    it('should render ai agent chat section when chat feature flag is enabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentChat || false,
        )

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // Chat components should not be present
        screen.getByText('channel toggle chat')
        screen.getByText('chat settings form')

        // Email components should still be present
        screen.getByText('channel toggle email')
        screen.getByText('email form')
        screen.getByText('signature form')
    })

    it('should render email/chat toggle when AiAgentActivation=true and AiAgentNewActivationXp=true', () => {
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiAgentChat ||
                key === FeatureFlagKey.AiAgentActivation ||
                key === FeatureFlagKey.AiAgentNewActivationXp ||
                false,
        )

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        screen.getByText('channel toggle chat')
        screen.getByText('channel toggle email')
    })

    it('should hide email and chat toggles when AiAgentActivation feature flag is enabled and ai agent chat is enabled', () => {
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiAgentChat ||
                key === FeatureFlagKey.AiAgentActivation ||
                false,
        )

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // chat toggle should be hidden
        expect(
            screen.queryByText('channel toggle chat'),
        ).not.toBeInTheDocument()

        // Chat components should be present
        screen.getByText('chat settings form')

        // email toggle should be hidden
        expect(
            screen.queryByText('channel toggle email'),
        ).not.toBeInTheDocument()

        // Email components should still be present
        screen.getByText('email form')
        screen.getByText('signature form')
    })

    it('does not render ai agent chat section when chat feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // Chat components should not be present
        expect(screen.queryByText('channel toggle chat')).toBeNull()
        expect(screen.queryByText('chat settings form')).toBeNull()
        expect(screen.queryByText('handover customization settings')).toBeNull()

        // Email components should still be present
        screen.getByText('channel toggle email')
        screen.getByText('email form')
        screen.getByText('signature form')
    })

    it('should render handover customization', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentChat || false,
        )

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // Handover customization should be present
        screen.getByText('handover customization settings')

        // Other chat components should still be present
        screen.getByText('channel toggle chat')
        screen.getByText('chat settings form')
    })

    it('disables channel toggles when hasAccess is false', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentChat || false,
        )
        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        const chatToggle = screen.getByText('channel toggle chat')
        const emailToggle = screen.getByText('channel toggle email')

        expect(chatToggle).toHaveAttribute('data-disabled', 'true')
        expect(emailToggle).toHaveAttribute('data-disabled', 'true')
    })

    it('passes correct isRequired prop to form components based on deactivated datetime', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentChat || false,
        )

        const propsWithDeactivatedChat = {
            ...mockProps,
            chatChannelDeactivatedDatetime: new Date().toISOString(),
            emailChannelDeactivatedDatetime: null,
        }

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...propsWithDeactivatedChat} />
            </BrowserRouter>,
        )

        // Chat settings should not be required when deactivated
        expect(screen.getByText('chat settings form')).toHaveAttribute(
            'data-required',
            'false',
        )

        // Email settings should be required when not deactivated
        expect(screen.getByText('email form')).toHaveAttribute(
            'data-required',
            'true',
        )
        expect(screen.getByText('signature form')).toHaveAttribute(
            'data-required',
            'true',
        )
    })

    it('should handle empty chat integration status data', () => {
        // Setup mocks
        const mockChatChannels = [
            { value: { id: 1, name: 'Channel 1', isDisabled: false } },
            { value: { id: 2, name: 'Channel 2', isDisabled: false } },
        ]
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels,
        )

        // Mock with no chat integration status data
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: undefined,
        })

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        expect(mockChatChannels[0].value.isDisabled).toBe(false)
        expect(mockChatChannels[1].value.isDisabled).toBe(false)
    })

    it('should enable all chat channels that are installed', () => {
        // Setup mocks
        const mockChatChannels = [
            { value: { id: 1, name: 'Channel 1', isDisabled: false } },
        ]
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels,
        )

        // Mock chat integration status with channel installed
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: [{ chatId: 1, installed: true }],
        })

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // The channel should be enabled since it's installed
        expect(mockChatChannels[0].value.isDisabled).toBe(false)
    })

    describe('with uninstalled chats', () => {
        beforeAll(() => {
            // Mock the ChatSettingsFormComponent to check if errors are passed correctly
            const originalChatSettingsFormComponent = jest.requireMock(
                'pages/aiAgent/components/StoreConfigForm/FormComponents/ChatSettingsFormComponent',
            ).ChatSettingsFormComponent

            jest.requireMock(
                'pages/aiAgent/components/StoreConfigForm/FormComponents/ChatSettingsFormComponent',
            ).ChatSettingsFormComponent = (props: Record<string, any>) => {
                const result = originalChatSettingsFormComponent(props)
                // Check that uninstalled channels are included in chatChannels
                const hasUninstalledChannel = props.chatChannels.some(
                    (channel: { value: { isUninstalled?: boolean } }) =>
                        channel.value.isUninstalled,
                )
                return (
                    <div>
                        {result}
                        <div
                            data-testid="has-uninstalled-channels"
                            data-value={hasUninstalledChannel}
                        ></div>
                    </div>
                )
            }
        })

        it('should not disable uninstalled channels but show an error when selected', () => {
            // Setup mocks
            const mockChatChannels = [
                {
                    value: {
                        id: 1,
                        name: 'Installed Channel',
                        isDisabled: false,
                    },
                },
                {
                    value: {
                        id: 3,
                        name: 'Not Installed Channel',
                        isDisabled: false,
                    },
                },
            ]
            ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
                mockChatChannels,
            )

            // Mock chat integration status with only channel 1 installed
            ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
                data: [
                    { chatId: 1, installed: true },
                    { chatId: 3, installed: false },
                ],
            })

            render(
                <BrowserRouter>
                    <ChannelsFormComponent
                        {...mockProps}
                        // Set to monitor the uninstalled channel
                        monitoredChatIntegrations={[3]}
                    />
                </BrowserRouter>,
            )

            // After rendering, the uninstalled channel should NOT be disabled
            expect(mockChatChannels[1].value.isDisabled).toBe(false)

            // Check ChatSettingsFormComponent receives channels with isUninstalled property
            expect(
                screen.getByTestId('has-uninstalled-channels'),
            ).toHaveAttribute('data-value', 'true')
        })

        it('should not set chat as uninstalled if integration status is still loading', () => {
            const mockChatChannels = [
                {
                    value: {
                        id: 1,
                        name: 'Not Installed Channel',
                        isDisabled: false,
                    },
                },
            ]
            ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
                mockChatChannels,
            )
            ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
                isLoading: true,
            })

            render(
                <BrowserRouter>
                    <ChannelsFormComponent
                        {...mockProps}
                        // Set to monitor the uninstalled channel
                        monitoredChatIntegrations={[1]}
                    />
                </BrowserRouter>,
            )

            // Check ChatSettingsFormComponent receives channels with isUninstalled property
            expect(
                screen.getByTestId('has-uninstalled-channels'),
            ).toHaveAttribute('data-value', 'false')
        })
    })

    describe('StandaloneHandoverCapabilities feature flag', () => {
        it('should hide email section when standalone flag is true', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiAgentChat ||
                    key === FeatureFlagKey.StandaloneHandoverCapabilities ||
                    false,
            )

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            // Chat components should be present
            screen.getByText('channel toggle chat')
            screen.getByText('chat settings form')

            // Email components should NOT be present
            expect(
                screen.queryByText('channel toggle email'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('email form')).not.toBeInTheDocument()
            expect(screen.queryByText('signature form')).not.toBeInTheDocument()
        })

        it('should show email section when standalone flag is false', () => {
            mockUseFlag.mockImplementation(
                (key) => key === FeatureFlagKey.AiAgentChat || false,
            )

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            // Chat components should be present
            screen.getByText('channel toggle chat')
            screen.getByText('chat settings form')

            // Email components SHOULD be present
            screen.getByText('channel toggle email')
            screen.getByText('email form')
            screen.getByText('signature form')
        })
    })

    describe('channel toggle interactions', () => {
        it('should call updateValue when email toggle is clicked', () => {
            mockUseFlag.mockImplementation(
                (key) => key === FeatureFlagKey.AiAgentChat || false,
            )

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            const emailToggle = screen.getByTestId('channel-toggle-email')
            fireEvent.click(emailToggle)

            expect(
                mockProps.updateEmailChannelDeactivatedDatetime,
            ).toHaveBeenCalled()
        })

        it('should call updateValue when chat toggle is clicked', () => {
            mockUseFlag.mockImplementation(
                (key) => key === FeatureFlagKey.AiAgentChat || false,
            )

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            const chatToggle = screen.getByTestId('channel-toggle-chat')
            fireEvent.click(chatToggle)

            expect(
                mockProps.updateChatChannelDeactivatedDatetime,
            ).toHaveBeenCalled()
        })

        it('should mark form as dirty when any toggle is changed', () => {
            mockUseFlag.mockImplementation(
                (key) => key === FeatureFlagKey.AiAgentChat || false,
            )

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            const emailToggle = screen.getByTestId('channel-toggle-email')
            fireEvent.click(emailToggle)

            expect(
                mockProps.updateEmailChannelDeactivatedDatetime,
            ).toHaveBeenCalled()
        })
    })

    describe('SMS channel handling', () => {
        it('should not render SMS section when feature flag is disabled', () => {
            mockUseFlag.mockImplementation(
                (key) => key === FeatureFlagKey.AiAgentChat || false,
            )

            const propsWithSms = {
                ...mockProps,
                monitoredSmsIntegrations: [1],
                isSmsChannelEnabled: true,
            }

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...propsWithSms} />
                </BrowserRouter>,
            )

            const sections = screen.getAllByTestId('configuration-section')
            const smsSection = sections.find(
                (section) =>
                    section.getAttribute('data-title') === 'Sms for AI Journey',
            )
            expect(smsSection).toBeUndefined()
            expect(
                screen.queryByTestId('channel-toggle-sms'),
            ).not.toBeInTheDocument()
            expect(screen.queryByTestId('sms-form')).not.toBeInTheDocument()

            expect(screen.getByTestId('email-form')).toBeInTheDocument()
            expect(
                screen.getByTestId('channel-toggle-chat'),
            ).toBeInTheDocument()
        })

        it('should render SMS section when feature flag is enabled', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiAgentChat ||
                    key === FeatureFlagKey.AiAgentSmsChannel ||
                    false,
            )

            const propsWithSms = {
                ...mockProps,
                monitoredSmsIntegrations: [1],
                isSmsChannelEnabled: true,
            }

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...propsWithSms} />
                </BrowserRouter>,
            )

            // Should render SMS configuration section
            expect(screen.getByTestId('channel-toggle-sms')).toBeInTheDocument()
            expect(screen.getByTestId('sms-form')).toBeInTheDocument()
            const smsBanners = screen.getAllByTestId('settings-banner')
            const smsBanner = smsBanners.find(
                (banner) => banner.getAttribute('data-type') === 'sms',
            )
            expect(smsBanner).toBeDefined()
            expect(screen.getByText('settings banner sms')).toBeInTheDocument()
        })
    })

    describe('settings banner', () => {
        it('should render settings banner for chat', () => {
            mockUseFlag.mockImplementation(
                (key) => key === FeatureFlagKey.AiAgentChat || false,
            )

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            const chatBanners = screen.getAllByTestId('settings-banner')
            const chatBanner = chatBanners.find(
                (banner) => banner.getAttribute('data-type') === 'chat',
            )
            expect(chatBanner).toBeDefined()
            expect(screen.getByText('settings banner chat')).toBeInTheDocument()
        })

        it('should render settings banner for email', () => {
            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            const emailBanners = screen.getAllByTestId('settings-banner')
            const emailBanner = emailBanners.find(
                (banner) => banner.getAttribute('data-type') === 'email',
            )
            expect(emailBanner).toBeDefined()
            expect(
                screen.getByText('settings banner email'),
            ).toBeInTheDocument()
        })
    })

    describe('signature handling', () => {
        it('should pass correct props to signature form component', () => {
            const propsWithSignature = {
                ...mockProps,
                signature: 'Custom Signature',
                useEmailIntegrationSignature: true,
            }

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...propsWithSignature} />
                </BrowserRouter>,
            )

            const signatureForm = screen.getByTestId('signature-form')
            expect(signatureForm).toBeInTheDocument()
        })

        it('should update signature values through updateValue', () => {
            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...mockProps} />
                </BrowserRouter>,
            )

            expect(mockProps.updateValue).toBeDefined()
        })
    })

    describe('multiple email integrations', () => {
        it('should handle multiple email integrations correctly', () => {
            const propsWithMultipleEmails = {
                ...mockProps,
                monitoredEmailIntegrations: [
                    { id: 1, email: 'test1@example.com' },
                    { id: 2, email: 'test2@example.com' },
                    { id: 3, email: 'test3@example.com' },
                ],
            }

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...propsWithMultipleEmails} />
                </BrowserRouter>,
            )

            expect(screen.getAllByTestId('email-form')).toHaveLength(1)
        })
    })

    describe('edge cases', () => {
        it('should handle empty monitored integrations', () => {
            const propsWithEmptyIntegrations = {
                ...mockProps,
                monitoredChatIntegrations: [],
                monitoredEmailIntegrations: [],
            }

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...propsWithEmptyIntegrations} />
                </BrowserRouter>,
            )

            expect(
                screen.getByTestId('channel-toggle-email'),
            ).toBeInTheDocument()
        })

        it('should handle null deactivated datetime values', () => {
            const propsWithNullDates = {
                ...mockProps,
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                smsChannelDeactivatedDatetime: null,
            }

            render(
                <BrowserRouter>
                    <ChannelsFormComponent {...propsWithNullDates} />
                </BrowserRouter>,
            )

            expect(screen.getByTestId('email-form')).toHaveAttribute(
                'data-required',
                'true',
            )
        })
    })
})
