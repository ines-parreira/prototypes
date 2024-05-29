import {render, screen} from '@testing-library/react'
import React from 'react'
import PhoneDevice from '../PhoneDevice'

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDeviceDialer',
    () => {
        return () => <div data-testid="mock-phone-device-dialer"></div>
    }
)

const renderComponent = ({isOpen = true}: {isOpen?: boolean} = {}) => {
    return render(
        <PhoneDevice
            isOpen={isOpen}
            setIsOpen={() => {}}
            target={{current: null} as React.RefObject<null>}
        />
    )
}

describe('PhoneDevice', () => {
    it('renders dialer when isOpen is true', () => {
        renderComponent()

        expect(screen.getByTestId('mock-phone-device-dialer')).toBeVisible()
    })

    it('does not render dialer when isOpen is false', () => {
        const {queryByTestId} = renderComponent({isOpen: false})

        expect(queryByTestId('mock-phone-device-dialer')).toBeNull()
    })
})
