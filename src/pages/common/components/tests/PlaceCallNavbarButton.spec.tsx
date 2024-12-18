import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import React from 'react'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import useHasPhone from 'hooks/useHasPhone'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'
import {isDesktopDevice, isDeviceReady} from 'utils/device'
import * as platform from 'utils/platform'
import {assumeMock} from 'utils/testing'

import PlaceCallNavbarButton from '../PlaceCallNavbarButton'

jest.mock('hooks/useConditionalShortcuts')
jest.mock('utils/device')
jest.mock('../DeactivatedViewIcon', () => () => (
    <div data-testid="deactivated-view-icon" />
))
jest.mock('pages/integrations/integration/components/phone/PhoneDevice')
jest.mock('hooks/integrations/phone/useVoiceDevice')
jest.mock('hooks/useHasPhone')

const isDesktopDeviceMock = assumeMock(isDesktopDevice)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)
const useHasPhoneMock = assumeMock(useHasPhone)
const PhoneDeviceMock = assumeMock(PhoneDevice)
const isDeviceReadyMock = assumeMock(isDeviceReady)
const useConditionalShortcutsMock = assumeMock(useConditionalShortcuts)

describe('<PlaceCallNavbarButton />', () => {
    const renderComponent = () => render(<PlaceCallNavbarButton />)

    beforeEach(() => {
        isDesktopDeviceMock.mockReturnValue(true)
        useHasPhoneMock.mockReturnValue(true)
        useVoiceDeviceMock.mockReturnValue({device: {}} as any)
        isDeviceReadyMock.mockReturnValue(true)

        PhoneDeviceMock.mockImplementation(({isOpen}: {isOpen: boolean}) => (
            <div data-testid="phone-device">
                {isOpen ? 'visible' : 'hidden'}
            </div>
        ))
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
            }
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

    it('should open PhoneDevice on shortcut', () => {
        renderComponent()

        useConditionalShortcutsMock.mock.calls[0][2]?.OPEN_DIALPAD?.action?.({
            preventDefault: jest.fn(),
        } as unknown as Event)

        expect(screen.getByTestId('phone-device')).toHaveTextContent('visible')
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

        expect(screen.getByTestId('deactivated-view-icon')).toBeInTheDocument()
        expect(
            screen.getByRole('button', {name: /Place call/})
        ).toBeAriaDisabled()
        expect(useConditionalShortcutsMock.mock.lastCall?.[0]).toBe(false)
    })

    it('should close PhoneDevice when device is removed', () => {
        const {rerender} = renderComponent()

        const button = screen.getByText('Place call')
        fireEvent.click(button)

        expect(screen.getByTestId('phone-device')).toHaveTextContent('visible')

        useVoiceDeviceMock.mockReturnValue({device: null} as any)
        rerender(<PlaceCallNavbarButton />)

        expect(screen.getByTestId('phone-device')).toHaveTextContent('hidden')
    })

    it('should display keyboard shortcut tooltip when hovered on non-MacOS', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: false,
            writable: true,
        })
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
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })
        renderComponent()

        const button = screen.getByText('Place call')
        fireEvent.mouseOver(button)

        await waitFor(() => {
            screen.getByRole('tooltip')
        })

        expect(screen.getByText('Open the dialpad')).toBeInTheDocument()
        expect(screen.getByText('⌘')).toBeInTheDocument()
    })
})
