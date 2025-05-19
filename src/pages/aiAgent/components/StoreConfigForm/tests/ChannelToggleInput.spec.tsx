import { ComponentProps } from 'react'

import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketChannel } from 'business/types/ticket'
import { logEvent, SegmentEvent } from 'common/segment'
import {
    BannerText,
    SettingsBannerType,
} from 'pages/aiAgent/components/StoreConfigForm/constants'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { ChannelToggleInput } from '../FormComponents/ChannelToggleInput'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('common/segment', () => ({
    ...jest.requireActual('common/segment'),
    logEvent: jest.fn(),
}))

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

const mockLogEvent = jest.mocked(logEvent)

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {}

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        clear: () => {
            store = {}
        },
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

const renderComponent = (
    props?: Partial<ComponentProps<typeof ChannelToggleInput>>,
) => {
    renderWithStoreAndQueryClientProvider(
        <ChannelToggleInput
            isToggled={true}
            onUpdate={jest.fn()}
            channel="email"
            type={SettingsBannerType.Chat}
            {...props}
        />,
    )
}

describe('ChannelToggleInput', () => {
    beforeEach(() => {
        mockLogEvent.mockClear()
        localStorage.clear()
        jest.clearAllMocks()
    })

    test.each(['email', 'chat'])('should render for %s', (channel) => {
        renderComponent({
            channel: channel as ComponentProps<
                typeof ChannelToggleInput
            >['channel'],
        })

        expect(
            screen.getAllByText('Enable AI Agent on Chat')[0],
        ).toBeInTheDocument()
    })

    it.each<['chat' | 'email', SegmentEvent]>([
        ['chat', SegmentEvent.AiAgentChatConfigurationDisabled],
        ['email', SegmentEvent.AiAgentEmailConfigurationDisabled],
    ])(
        'should fire segment event for %s when toggle is off',
        (channel, segmentEvent) => {
            const onUpdate = jest.fn()

            renderComponent({ onUpdate, channel })
            fireEvent.click(screen.getByRole('switch'))

            expect(onUpdate).toHaveBeenCalledWith(false)
            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(segmentEvent)
        },
    )

    describe.each([SettingsBannerType.Chat, SettingsBannerType.Email])(
        'for %s',
        (channel) => {
            it('should not show the banner if deactivatedDatetime is not provided and localStorage has no acknowledgment', () => {
                renderComponent({ channel, type: channel })
                expect(
                    screen.queryByText(BannerText[channel]),
                ).not.toBeInTheDocument()
            })

            it('should show the banner if deactivatedDatetime is provided and localStorage has no acknowledgment', () => {
                renderComponent({
                    channel,
                    type: channel,
                    deactivatedDatetime: '2024-09-24',
                })

                expect(
                    screen.getByText(BannerText[channel]),
                ).toBeInTheDocument()
            })

            it('should hide the banner if it has been acknowledged in localStorage', () => {
                localStorage.setItem(
                    `ai-settings-${channel}-banner-acknowledged`,
                    'true',
                )
                renderComponent({
                    channel,
                    type: channel,
                    deactivatedDatetime: '2024-09-24',
                })

                expect(
                    screen.queryByText(BannerText[channel]),
                ).not.toBeInTheDocument()
            })

            it('should show the banner and hide it when the close button is clicked', () => {
                localStorage.setItem(
                    `ai-settings-${channel}-banner-acknowledged`,
                    'false',
                )
                renderComponent({
                    channel,
                    type: channel,
                    deactivatedDatetime: '2024-09-24',
                })

                expect(
                    screen.getByText(BannerText[channel]),
                ).toBeInTheDocument()

                userEvent.click(screen.getByRole('img', { name: 'close-icon' }))

                expect(
                    localStorage.getItem(
                        `ai-settings-${channel}-banner-acknowledged`,
                    ),
                ).toBe('true')
                expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
            })
        },
    )

    describe('Chat-specific behavior', () => {
        it('should disable the toggle when warning banner is shown', () => {
            const chatIntegrations: SelfServiceChatChannel[] = [
                {
                    type: TicketChannel.Chat,
                    value: {
                        id: 15,
                        isDisabled: true,
                    } as any,
                },
            ]

            renderComponent({
                type: SettingsBannerType.Chat,
                chatIntegrations,
            })

            // Check that the element has the attributes that indicate it's disabled
            const toggle = screen.getByRole('switch')
            expect(toggle.className).toContain('disabled')
            expect(toggle).toHaveAttribute('aria-checked', 'false')
        })

        it('should not show warning banner for email type', () => {
            const chatIntegrations: SelfServiceChatChannel[] = [
                {
                    type: TicketChannel.Chat,
                    value: {
                        id: 15,
                        isDisabled: true,
                    } as any,
                },
            ]

            renderComponent({
                type: SettingsBannerType.Email,
                chatIntegrations,
            })

            expect(
                screen.queryByText(
                    'A chat integration must be installed for this store.',
                ),
            ).not.toBeInTheDocument()
        })
    })
})
