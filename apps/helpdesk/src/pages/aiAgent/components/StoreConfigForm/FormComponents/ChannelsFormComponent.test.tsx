import { FeatureFlagKey } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { useFlag } from 'core/flags'

import { ChannelsFormComponent } from './ChannelsFormComponent'

jest.mock('core/flags')
jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: () => ({
        hasAccess: true,
    }),
}))
jest.mock('../hooks/useSmsPhoneNumbers', () => ({
    useSmsPhoneNumbers: () => [{ id: 1, name: 'Test Phone' }],
}))
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: () => [],
}))
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            automationOrderManagement: '/automation/order-management',
            automationFlows: '/automation/flows',
        },
    }),
}))
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData',
    () => ({
        useFetchChatIntegrationsStatusData: () => ({
            data: [],
            isLoading: false,
        }),
    }),
)
jest.mock('./ChatSettingsFormComponent', () => ({
    ChatSettingsFormComponent: () => (
        <div data-testid="chat-settings-form">Chat Settings</div>
    ),
}))
jest.mock('./EmailFormComponent', () => ({
    EmailFormComponent: () => <div data-testid="email-form">Email Form</div>,
}))
jest.mock('./SignatureFormComponent', () => ({
    SignatureFormComponent: () => (
        <div data-testid="signature-form">Signature Form</div>
    ),
}))
jest.mock('./SmsSettingsFormComponent', () => ({
    SmsSettingsFormComponent: () => (
        <div data-testid="sms-settings-form">SMS Settings</div>
    ),
}))
jest.mock('./ChannelToggleInput', () => ({
    ChannelToggleInput: () => (
        <div data-testid="channel-toggle">Channel Toggle</div>
    ),
}))
jest.mock(
    'pages/aiAgent/components/HandoverCustomization/HandoverCustomizationChatSettingsComponent',
    () => ({
        HandoverCustomizationChatSettingsComponent: () => (
            <div data-testid="handover-customization">
                Handover Customization
            </div>
        ),
    }),
)

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('ChannelsFormComponent', () => {
    const defaultProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        updateValue: jest.fn(),
        monitoredChatIntegrations: [],
        isChatChannelEnabled: false,
        chatChannelDeactivatedDatetime: null,
        updateChatChannelDeactivatedDatetime: jest.fn(),
        signature: null,
        useEmailIntegrationSignature: null,
        monitoredEmailIntegrations: [],
        isEmailChannelEnabled: false,
        emailChannelDeactivatedDatetime: null,
        updateEmailChannelDeactivatedDatetime: jest.fn(),
        monitoredSmsIntegrations: [],
        smsDisclaimer: null,
        isSmsChannelEnabled: false,
        smsChannelDeactivatedDatetime: null,
        updateSmsChannelDeactivatedDatetime: jest.fn(),
        setIsFormDirty: jest.fn(),
    }

    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    describe('SMS Channel', () => {
        it('should render SMS configuration section when AiAgentSmsChannel feature flag is enabled', () => {
            mockUseFlag.mockImplementation((flagKey) => {
                if (flagKey === FeatureFlagKey.AiAgentSmsChannel) {
                    return true
                }
                return false
            })

            render(<ChannelsFormComponent {...defaultProps} section="sms" />)

            expect(screen.getByTestId('sms-settings-form')).toBeInTheDocument()
        })

        it('should not render SMS configuration section when AiAgentSmsChannel feature flag is disabled', () => {
            mockUseFlag.mockImplementation((flagKey) => {
                if (flagKey === FeatureFlagKey.AiAgentSmsChannel) {
                    return false
                }
                return false
            })

            render(<ChannelsFormComponent {...defaultProps} section="sms" />)

            expect(
                screen.queryByTestId('sms-settings-form'),
            ).not.toBeInTheDocument()
        })

        it('should render SMS configuration section when feature flag is enabled and section is "all"', () => {
            mockUseFlag.mockImplementation((flagKey) => {
                if (flagKey === FeatureFlagKey.AiAgentSmsChannel) {
                    return true
                }
                return false
            })

            render(<ChannelsFormComponent {...defaultProps} section="all" />)

            expect(screen.getByTestId('sms-settings-form')).toBeInTheDocument()
        })

        it('should not render SMS configuration section when section is "chat" even if flag is enabled', () => {
            mockUseFlag.mockImplementation((flagKey) => {
                if (flagKey === FeatureFlagKey.AiAgentSmsChannel) {
                    return true
                }
                return false
            })

            render(<ChannelsFormComponent {...defaultProps} section="chat" />)

            expect(
                screen.queryByTestId('sms-settings-form'),
            ).not.toBeInTheDocument()
        })
    })
})
