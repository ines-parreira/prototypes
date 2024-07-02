import React from 'react'
import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import {isDesktopDevice, isDeviceReady} from 'utils/device'
import {assumeMock} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHasPhone from 'core/app/hooks/useHasPhone'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'
import PlaceCallNavbarButton from '../PlaceCallNavbarButton'

jest.mock('utils/device')
jest.mock('../DeactivatedViewIcon', () => () => (
    <div data-testid="deactivated-view-icon" />
))
jest.mock('pages/integrations/integration/components/phone/PhoneDevice')
jest.mock('hooks/integrations/phone/useVoiceDevice')
jest.mock('core/app/hooks/useHasPhone')

const isDesktopDeviceMock = assumeMock(isDesktopDevice)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)
const useHasPhoneMock = assumeMock(useHasPhone)
const PhoneDeviceMock = assumeMock(PhoneDevice)
const isDeviceReadyMock = assumeMock(isDeviceReady)

describe('<PlaceCallNavbarButton />', () => {
    const renderComponent = () => render(<PlaceCallNavbarButton />)

    beforeEach(() => {
        isDesktopDeviceMock.mockReturnValue(true)
        useHasPhoneMock.mockReturnValue(true)
        mockFlags({
            [FeatureFlagKey.OutboundDialer]: true,
        })
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
    })

    it('should not render when OutboundDialer flag is disabled', () => {
        mockFlags({
            [FeatureFlagKey.OutboundDialer]: false,
        })

        renderComponent()
        expect(screen.queryByText('Place call')).toBeNull()
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
        ).toHaveAttribute('aria-disabled', 'true')
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
})
