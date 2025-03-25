import { render, screen } from '@testing-library/react'

import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'

import { useHandoverCustomizationComponent } from '../../../../hooks/useHandoverCustomizationComponent'
import { HandoverCustomizationSettingsFormComponent } from '../HandoverCustomizationSettingsFormComponent'

jest.mock('../../../../hooks/useHandoverCustomizationComponent')

// Mock the imported components
jest.mock(
    '../../HandoverCustomizationSettingsComponents/HandoverCustomizationOfflineSettings',
    () =>
        jest.fn(() => (
            <div data-testid="mock-offline-settings">
                mocked offline settings
            </div>
        )),
)

jest.mock(
    '../../HandoverCustomizationSettingsComponents/HandoverCustomizationOnlineSettings',
    () =>
        jest.fn(() => (
            <div data-testid="mock-online-settings">mocked online settings</div>
        )),
)
jest.mock(
    '../../HandoverCustomizationSettingsComponents/HandoverCustomizationFallbackSettings',
    () =>
        jest.fn(() => (
            <div data-testid="mock-fallback-settings">
                mocked fallback settings
            </div>
        )),
)

describe('HandoverCustomizationSettingsFormComponent', () => {
    const mockProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        monitoredChatIntegrationIds: [14, 15],
    }

    const mockedOnSelectedChatChange = jest.fn()
    const mockedOnActiveSettingsSectionChange = jest.fn()

    const mockedUseHandoverCustomizationComponentProps = {
        availableChats: mockChatChannels,
        selectedChat: mockChatChannels[0],
        onSelectedChatChange: mockedOnSelectedChatChange,
        onActiveSettingsSectionChange: mockedOnActiveSettingsSectionChange,
        activeSettingsSection: undefined,
        isHandoverSectionDisabled: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHandoverCustomizationComponent as jest.Mock).mockReturnValue(
            mockedUseHandoverCustomizationComponentProps,
        )
    })

    it('renders the component correctly', () => {
        render(<HandoverCustomizationSettingsFormComponent {...mockProps} />)

        expect(useHandoverCustomizationComponent).toHaveBeenCalledWith(
            mockProps,
        )

        screen.getByText('Handover instructions')
        screen.getByText('When offline or outside business hours')
        screen.getByText('mocked offline settings')
        screen.getByText('When online')
        screen.getByText('mocked online settings')
        screen.getByText('When an error occurs')
        screen.getByText('mocked fallback settings')
    })

    it('should not render any section content when there is no integration selected to configure', () => {
        ;(useHandoverCustomizationComponent as jest.Mock).mockReturnValue({
            ...mockedUseHandoverCustomizationComponentProps,
            selectedChat: undefined,
        })

        const props = {
            ...mockProps,
            monitoredChatIntegrationIds: [],
        }

        render(<HandoverCustomizationSettingsFormComponent {...props} />)

        expect(useHandoverCustomizationComponent).toHaveBeenCalledWith(props)

        screen.queryByText(/Handover instructions/i)

        // titles should be present
        screen.getByText('When offline or outside business hours')
        screen.getByText('When online')
        screen.getByText('When an error occurs')

        // sections should not be rendered
        expect(screen.queryByText(/mocked offline settings/i)).toBeNull()
        expect(screen.queryByText(/mocked online settings/i)).toBeNull()
        expect(screen.queryByText(/mocked fallback settings/i)).toBeNull()
    })

    describe('Chat selection', () => {
        it('should not render the chat selection if there is one chat channel', () => {
            ;(useHandoverCustomizationComponent as jest.Mock).mockReturnValue({
                ...mockedUseHandoverCustomizationComponentProps,
                availableChats: [mockChatChannels[0]],
                selectedChat: mockChatChannels[0],
            })

            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(<HandoverCustomizationSettingsFormComponent {...props} />)

            expect(useHandoverCustomizationComponent).toHaveBeenCalledWith(
                props,
            )

            expect(screen.queryByText('26 Shopify Chat')).toBeNull()
            expect(screen.queryByRole('textbox')).toBeNull()
        })

        it('should render the chat selection if there is more than one chat channel', () => {
            render(
                <HandoverCustomizationSettingsFormComponent
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
            ;(useHandoverCustomizationComponent as jest.Mock).mockReturnValue({
                ...mockedUseHandoverCustomizationComponentProps,
                availableChats: [mockChatChannels[0]],
                selectedChat: mockChatChannels[0],
            })

            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(<HandoverCustomizationSettingsFormComponent {...props} />)

            expect(useHandoverCustomizationComponent).toHaveBeenCalledWith(
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

            render(<HandoverCustomizationSettingsFormComponent {...props} />)

            expect(useHandoverCustomizationComponent).toHaveBeenCalledWith(
                props,
            )

            // sections should not be rendered
            screen.getByText(/mocked offline settings/i)
            screen.getByText(/mocked online settings/i)
            screen.getByText(/mocked fallback settings/i)
        })
    })
})
