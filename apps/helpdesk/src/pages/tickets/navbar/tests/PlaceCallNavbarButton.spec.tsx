import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { isDesktopDevice, useConditionalShortcuts } from '@repo/utils'
import { isDeviceReady } from '@repo/voice'
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'

import {
    DEFAULT_ERROR_MESSAGE,
    MICROPHONE_PERMISSION_ERROR_MESSAGE,
} from 'business/twilio'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHasPhone from 'hooks/useHasPhone'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'

import { PlaceCallNavbarButton } from '../PlaceCallNavbarButton'

let mockIsMacOs = false

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    get isMacOs() {
        return mockIsMacOs
    },
    isDesktopDevice: jest.fn(),
    useConditionalShortcuts: jest.fn(),
}))
jest.mock('@repo/voice', () => ({
    isDeviceReady: jest.fn(),
}))
jest.mock(
    'pages/common/components/DeactivatedViewIcon',
    () =>
        ({ tooltipText }: any) => <div>{tooltipText}</div>,
)
jest.mock('pages/integrations/integration/components/phone/PhoneDevice')
jest.mock('hooks/integrations/phone/useVoiceDevice')
jest.mock('hooks/useHasPhone')
jest.mock(
    'pages/integrations/integration/components/voice/useMicrophonePermissions',
)
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        PlaceCallButtonClicked: 'PlaceCallButtonClicked',
    },
}))

const isDesktopDeviceMock = assumeMock(isDesktopDevice)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)
const useHasPhoneMock = assumeMock(useHasPhone)
const PhoneDeviceMock = assumeMock(PhoneDevice)
const isDeviceReadyMock = assumeMock(isDeviceReady)
const useConditionalShortcutsMock = assumeMock(useConditionalShortcuts)
const useMicrophonePermissionsMock = assumeMock(useMicrophonePermissions)

describe('<PlaceCallNavbarButton />', () => {
    const renderComponent = () => render(<PlaceCallNavbarButton />)

    beforeEach(() => {
        mockIsMacOs = false
        isDesktopDeviceMock.mockReturnValue(true)
        useHasPhoneMock.mockReturnValue(true)
        useVoiceDeviceMock.mockReturnValue({ device: {} } as any)
        isDeviceReadyMock.mockReturnValue(true)
        useMicrophonePermissionsMock.mockReturnValue({
            permissionDenied: false,
        })

        PhoneDeviceMock.mockImplementation(
            ({ isOpen }: { isOpen: boolean }) => (
                <div data-testid="phone-device">
                    {isOpen ? 'visible' : 'hidden'}
                </div>
            ),
        )
    })

    afterEach(cleanup)

    it('should render correctly', () => {
        renderComponent()

        const placeCallButton = screen.getByText('Place call')
        const phoneIcon = screen.getByText(/phone/i)

        expect(placeCallButton).toBeInTheDocument()
        expect(phoneIcon).toBeInTheDocument()

        expect(useConditionalShortcutsMock).toHaveBeenCalledWith(
            true,
            'Dialpad',
            {
                OPEN_DIALPAD: {
                    action: expect.any(Function),
                },
            },
        )
    })

    it('should not render on mobile devices', () => {
        isDesktopDeviceMock.mockReturnValue(false)

        renderComponent()
        expect(screen.queryByText('Place call')).toBeNull()
    })

    it('should not render when there are no phone integrations', () => {
        useHasPhoneMock.mockReturnValue(false)

        renderComponent()
        expect(screen.queryByText('Place call')).toBeNull()
        expect(useConditionalShortcutsMock.mock.lastCall?.[0]).toBe(false)
    })

    it('should open PhoneDevice on shortcut', async () => {
        renderComponent()

        useConditionalShortcutsMock.mock.calls[0][2]?.OPEN_DIALPAD?.action?.({
            preventDefault: jest.fn(),
        } as unknown as Event)

        await waitFor(() => {
            expect(screen.getByTestId('phone-device')).toHaveTextContent(
                'visible',
            )
        })
    })

    it('should open PhoneDevice on button click', () => {
        renderComponent()

        const button = screen.getByText('Place call')
        fireEvent.click(button)

        expect(screen.getByTestId('phone-device')).toHaveTextContent('visible')

        fireEvent.click(button)
        expect(screen.getByTestId('phone-device')).toHaveTextContent('hidden')
    })

    it('should render DeactivatedViewIcon and disable button when device is not ready', () => {
        isDeviceReadyMock.mockReturnValue(false)
        renderComponent()

        expect(screen.getByText(DEFAULT_ERROR_MESSAGE)).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Place call/ }),
        ).toBeDisabled()
        expect(useConditionalShortcutsMock.mock.lastCall?.[0]).toBe(false)
    })

    it('should render DeactivatedViewIcon and disable button when microphone permissions are denied', () => {
        useMicrophonePermissionsMock.mockReturnValue({ permissionDenied: true })
        renderComponent()

        expect(
            screen.getByText(MICROPHONE_PERMISSION_ERROR_MESSAGE),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Place call/ }),
        ).toBeDisabled()
    })

    it('should close PhoneDevice when device is removed', () => {
        const { rerender } = renderComponent()

        const button = screen.getByText('Place call')
        fireEvent.click(button)

        expect(screen.getByTestId('phone-device')).toHaveTextContent('visible')

        useVoiceDeviceMock.mockReturnValue({ device: null } as any)
        rerender(<PlaceCallNavbarButton />)

        expect(screen.getByTestId('phone-device')).toHaveTextContent('hidden')
    })

    it('should display keyboard shortcut tooltip when hovered on non-MacOS', async () => {
        mockIsMacOs = false
        renderComponent()

        const button = screen.getByText('Place call')
        fireEvent.mouseOver(button)

        await waitFor(() => {
            screen.getByRole('tooltip')
        })

        expect(screen.getByText('Open the dialpad')).toBeInTheDocument()
        expect(screen.getByText('ctrl')).toBeInTheDocument()
    })

    it('should display keyboard shortcut tooltip when hovered on MacOS', async () => {
        mockIsMacOs = true
        renderComponent()

        const button = screen.getByText('Place call')
        fireEvent.mouseOver(button)

        await waitFor(() => {
            screen.getByRole('tooltip')
        })

        expect(screen.getByText('Open the dialpad')).toBeInTheDocument()
        expect(screen.getByText('⌘')).toBeInTheDocument()
    })

    it('should log PlaceCallButtonClicked event when place call button is clicked', async () => {
        renderComponent()

        const button = screen.getByText('Place call')
        await userEvent.click(button)

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.PlaceCallButtonClicked,
        )
    })
})
