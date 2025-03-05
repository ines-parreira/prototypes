import React from 'react'

import { render, screen } from '@testing-library/react'

import useId from 'hooks/useId'
import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { assumeMock } from 'utils/testing'

import { HandoverCustomizationSettingsFormComponent } from '../HandoverCustomizationSettingsFormComponent'

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

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')

jest.mock('hooks/useId', () => jest.fn())
const useIdMock = assumeMock(useId)

// Mock the useCallback and setState functions
const mockSetSelectedChat = jest.fn()
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn((initial) => [initial, mockSetSelectedChat]),
    useCallback: jest.fn((fn) => fn),
}))

const mockedUseSelfServiceChatChannels = jest.mocked(useSelfServiceChatChannels)

describe('HandoverCustomizationSettingsFormComponent', () => {
    const mockProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        monitoredChatIntegrationIds: [14, 15],
    }

    beforeEach(() => {
        jest.clearAllMocks()

        useIdMock.mockReturnValue('123')

        mockedUseSelfServiceChatChannels.mockReturnValue(mockChatChannels)
    })

    it('renders the component correctly', () => {
        render(<HandoverCustomizationSettingsFormComponent {...mockProps} />)

        screen.getByText('Handover instructions')
        screen.getByText('When offline or outside business hours')
        screen.getByText('mocked offline settings')
        screen.getByText('When online')
        screen.getByText('mocked online settings')
    })

    it('should render the offline settings', () => {
        render(<HandoverCustomizationSettingsFormComponent {...mockProps} />)

        screen.getByText('mocked offline settings')
    })

    it('should render the online settings', () => {
        render(<HandoverCustomizationSettingsFormComponent {...mockProps} />)

        screen.getByText('mocked online settings')
    })

    it('should render the fallback settings', () => {
        render(<HandoverCustomizationSettingsFormComponent {...mockProps} />)

        screen.getByText('mocked fallback settings')
    })

    it('should not render anything when there is no integration selected to configure', () => {
        render(
            <HandoverCustomizationSettingsFormComponent
                {...mockProps}
                monitoredChatIntegrationIds={[]}
            />,
        )

        expect(screen.queryByText(/Handover instructions/i)).toBeNull()
    })

    describe('Chat selection', () => {
        it('should not render the chat selection if there is one chat channel', () => {
            render(
                <HandoverCustomizationSettingsFormComponent
                    {...mockProps}
                    monitoredChatIntegrationIds={[14]}
                />,
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
})
