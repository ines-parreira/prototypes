import {render, screen} from '@testing-library/react'
import React from 'react'
import {assumeMock} from 'utils/testing'
import PhoneDevice from '../PhoneDevice'
import PhoneDeviceDialer from '../PhoneDeviceDialer'

jest.mock('pages/integrations/integration/components/phone/PhoneDeviceDialer')

const PhoneDeviceDialerMock = assumeMock(PhoneDeviceDialer)

describe('PhoneDevice', () => {
    const setIsOpen = jest.fn()

    const renderComponent = ({isOpen = true}: {isOpen?: boolean} = {}) => {
        return render(
            <PhoneDevice
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                target={{current: null} as React.RefObject<null>}
            />
        )
    }

    beforeEach(() => {
        PhoneDeviceDialerMock.mockImplementation(() => (
            <div data-testid="mock-phone-device-dialer"></div>
        ))
    })

    it('renders dialer when isOpen is true', () => {
        renderComponent()

        expect(screen.getByTestId('mock-phone-device-dialer')).toBeVisible()
    })

    it('does not render dialer when isOpen is false', () => {
        const {queryByTestId} = renderComponent({isOpen: false})

        expect(queryByTestId('mock-phone-device-dialer')).toBeNull()
    })

    it('closes device when call is initiated', () => {
        renderComponent()

        PhoneDeviceDialerMock.mock.calls[0][0].onCallInitiated()
        expect(setIsOpen).toHaveBeenCalledWith(false)
    })
})
