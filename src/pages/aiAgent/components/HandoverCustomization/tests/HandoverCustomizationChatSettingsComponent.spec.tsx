import { render, screen } from '@testing-library/react'

import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import { useHandoverCustomizationChatSettings } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings'

import { HandoverCustomizationChatSettingsComponent } from '../HandoverCustomizationChatSettingsComponent'

jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings',
)

// Mock the imported components
jest.mock('../FormComponents/HandoverCustomizationChatOfflineSettings', () =>
    jest.fn(() => (
        <div data-testid="mock-offline-settings">mocked offline settings</div>
    )),
)

jest.mock('../FormComponents/HandoverCustomizationChatOnlineSettings', () =>
    jest.fn(() => (
        <div data-testid="mock-online-settings">mocked online settings</div>
    )),
)
jest.mock('../FormComponents/HandoverCustomizationChatFallbackSettings', () =>
    jest.fn(() => (
        <div data-testid="mock-fallback-settings">mocked fallback settings</div>
    )),
)

describe('HandoverCustomizationChatSettingsComponent', () => {
    const mockProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        monitoredChatIntegrationIds: [14, 15],
    }

    const mockedOnSelectedChatChange = jest.fn()
    const mockedOnActiveSettingsSectionChange = jest.fn()

    const mockedUseHandoverCustomizationChatSettingsProps = {
        availableChats: mockChatChannels,
        selectedChat: mockChatChannels[0],
        onSelectedChatChange: mockedOnSelectedChatChange,
        onActiveSettingsSectionChange: mockedOnActiveSettingsSectionChange,
        activeSettingsSection: undefined,
        isHandoverSectionDisabled: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHandoverCustomizationChatSettings as jest.Mock).mockReturnValue(
            mockedUseHandoverCustomizationChatSettingsProps,
        )
    })

    it('renders the component correctly', () => {
        render(<HandoverCustomizationChatSettingsComponent {...mockProps} />)

        expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
            mockProps,
        )

        screen.getByText('Handover instructions')
        screen.getByText('When Chat is offline')
        screen.getByText('mocked offline settings')
        screen.getByText('When Chat is online')
        screen.getByText('mocked online settings')
        screen.getByText('When an error occurs')
        screen.getByText('mocked fallback settings')
    })

    it('should not render any section content when there is no integration selected to configure', () => {
        ;(useHandoverCustomizationChatSettings as jest.Mock).mockReturnValue({
            ...mockedUseHandoverCustomizationChatSettingsProps,
            selectedChat: undefined,
        })

        const props = {
            ...mockProps,
            monitoredChatIntegrationIds: [],
        }

        render(<HandoverCustomizationChatSettingsComponent {...props} />)

        expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(props)

        screen.queryByText(/Handover instructions/i)

        // titles should be present
        screen.getByText('When Chat is offline')
        screen.getByText('When Chat is online')
        screen.getByText('When an error occurs')

        // sections should not be rendered
        expect(screen.queryByText(/mocked offline settings/i)).toBeNull()
        expect(screen.queryByText(/mocked online settings/i)).toBeNull()
        expect(screen.queryByText(/mocked fallback settings/i)).toBeNull()
    })

    describe('Chat selection', () => {
        it('should not render the chat selection if there is one chat channel', () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                availableChats: [mockChatChannels[0]],
                selectedChat: mockChatChannels[0],
            })

            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(<HandoverCustomizationChatSettingsComponent {...props} />)

            expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
                props,
            )

            expect(screen.queryByText('26 Shopify Chat')).toBeNull()
            expect(screen.queryByRole('textbox')).toBeNull()
        })

        it('should render the chat selection if there is more than one chat channel', () => {
            render(
                <HandoverCustomizationChatSettingsComponent
                    {...mockProps}
                    monitoredChatIntegrationIds={[14, 15]}
                />,
            )

            screen.getByText('26 Shopify Chat')
            screen.getByRole('textbox')
        })
    })

    describe('Handover customization settings', () => {
        it('should render the handover customization settings when there is one chat channel', () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                availableChats: [mockChatChannels[0]],
                selectedChat: mockChatChannels[0],
            })

            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(<HandoverCustomizationChatSettingsComponent {...props} />)

            expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
                props,
            )

            // sections should not be rendered
            screen.getByText(/mocked offline settings/i)
            screen.getByText(/mocked online settings/i)
            screen.getByText(/mocked fallback settings/i)
        })

        it('should render the handover customization settings when there are more than one chat channel', () => {
            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14, 15],
            }

            render(<HandoverCustomizationChatSettingsComponent {...props} />)

            expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
                props,
            )

            // sections should not be rendered
            screen.getByText(/mocked offline settings/i)
            screen.getByText(/mocked online settings/i)
            screen.getByText(/mocked fallback settings/i)
        })
    })
})
