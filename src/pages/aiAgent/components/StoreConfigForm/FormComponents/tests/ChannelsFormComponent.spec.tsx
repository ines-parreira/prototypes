import React from 'react'

import { render, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { BrowserRouter } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { ChannelsFormComponent } from '../ChannelsFormComponent'

// Mock all hooks
jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: jest.fn(),
}))

// Mock all imported components
jest.mock(
    'pages/aiAgent/components/ConfigurationSection/ConfigurationSection',
    () => ({
        ConfigurationSection: ({
            children,
            title,
        }: {
            children: React.ReactNode
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
        }: {
            isToggled: boolean
            onUpdate: (isToggled: boolean) => void
            channel: string
            isDisabled: boolean
        }) => (
            <div
                data-testid={`channel-toggle-${channel}`}
                data-toggled={isToggled}
                data-disabled={isDisabled}
                onClick={() => onUpdate(!isToggled)}
            >
                channel toggle {channel}
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
        monitoredEmailIntegrations: [{ id: 1, email: 'test@example.com' }],
        isEmailChannelEnabled: true,
        emailChannelDeactivatedDatetime: null,
        updateEmailChannelDeactivatedDatetime: jest.fn(),
        setIsFormDirty: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock the feature flags
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        // Mock the app selector (hasAutomate)
        ;(useAppSelector as jest.Mock).mockReturnValue(true)

        // Mock the chat channels
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue([
            { value: { id: 1, name: 'Test Channel 1' } },
            { value: { id: 2, name: 'Test Channel 2' } },
            { value: { id: 3, name: 'Test Channel 3' } },
        ])

        // Mock store activations
        ;(useStoreActivations as jest.Mock).mockReturnValue({
            storeActivations: {
                'Test Shop': {
                    support: {
                        chat: {
                            availableChats: [1, 2], // Only channels 1 and 2 are available
                        },
                    },
                },
            },
        })
    })
    it('should render ai agent chat section when chat feature flag is enabled', () => {
        // Disable the chat feature flag
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
        })

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
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
            [FeatureFlagKey.AiAgentActivation]: true,
            [FeatureFlagKey.AiAgentNewActivationXp]: true,
        })

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        screen.getByText('channel toggle chat')
        screen.getByText('channel toggle email')
    })

    it('should hide email and chat toggles when AiAgentActivation feature flag is enabled and ai agent chat is enabled', () => {
        // Disable the chat feature flag
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
            [FeatureFlagKey.AiAgentActivation]: true,
        })

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
        // Disable the chat feature flag
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: false,
            [FeatureFlagKey.AiAgentActivation]: false,
        })

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
        // Disable only the handover customization feature flag
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
            [FeatureFlagKey.AiAgentActivation]: false,
        })

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

    it('disables channel toggles when hasAutomate is false', () => {
        ;(useAppSelector as jest.Mock).mockReturnValue(false)
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
            [FeatureFlagKey.AiAgentActivation]: false,
        })
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
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
        })

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

    it('should disable chat channels that are not in the available chats list', () => {
        // Setup mocks
        const mockChatChannels = [
            { value: { id: 1, name: 'Available Channel', isDisabled: false } },
            {
                value: {
                    id: 2,
                    name: 'Another Available Channel',
                    isDisabled: false,
                },
            },
            {
                value: {
                    id: 3,
                    name: 'Unavailable Channel',
                    isDisabled: false,
                },
            },
        ]
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels,
        )

        // Mock store activations with only channels 1 and 2 available
        ;(useStoreActivations as jest.Mock).mockReturnValue({
            storeActivations: {
                'Test Shop': {
                    support: {
                        chat: {
                            availableChats: [1, 2], // Only channels 1 and 2 are available
                        },
                    },
                },
            },
        })

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // After rendering, the useEffect should have modified the mockChatChannels array
        // Channel 1 and 2 should be enabled
        expect(mockChatChannels[0].value.isDisabled).toBe(false)
        expect(mockChatChannels[1].value.isDisabled).toBe(false)
        // Channel 3 should be disabled
        expect(mockChatChannels[2].value.isDisabled).toBe(true)
    })

    it('should handle empty available chats list', () => {
        // Setup mocks
        const mockChatChannels = [
            { value: { id: 1, name: 'Channel 1', isDisabled: false } },
            { value: { id: 2, name: 'Channel 2', isDisabled: false } },
        ]
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels,
        )

        // Mock store activations with no available chats
        ;(useStoreActivations as jest.Mock).mockReturnValue({
            storeActivations: {
                'Test Shop': {
                    support: {
                        chat: {
                            availableChats: [], // No channels available
                        },
                    },
                },
            },
        })

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // After rendering, all channels should be disabled
        expect(mockChatChannels[0].value.isDisabled).toBe(true)
        expect(mockChatChannels[1].value.isDisabled).toBe(true)
    })

    it('should handle missing storeActivations data', () => {
        // Setup mocks
        const mockChatChannels = [
            { value: { id: 1, name: 'Channel 1', isDisabled: false } },
        ]
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels,
        )

        // Mock store activations with missing data
        ;(useStoreActivations as jest.Mock).mockReturnValue({
            storeActivations: {},
        })

        render(
            <BrowserRouter>
                <ChannelsFormComponent {...mockProps} />
            </BrowserRouter>,
        )

        // The channel should be disabled since there's no activation data
        expect(mockChatChannels[0].value.isDisabled).toBe(true)
    })
})
