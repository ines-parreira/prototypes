import { render } from '@testing-library/react'

import { Navbar } from 'common/navigation'
import { VoiceOfCustomerNavbarContainer } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarContainer'
import { VoiceOfCustomerNavbarView } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarView'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'domains/reporting/pages/voice-of-customer/constants'
import { assumeMock } from 'utils/testing'

jest.mock('common/navigation')
const NavbarMock = assumeMock(Navbar)
jest.mock(
    'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarView',
)
const VoiceOfCustomerNavbarViewMock = assumeMock(VoiceOfCustomerNavbarView)

describe('VoiceOfCustomerNavbarContainer', () => {
    beforeEach(() => {
        VoiceOfCustomerNavbarViewMock.mockImplementation(() => <div />)
        NavbarMock.mockImplementation(({ children }) => <div>{children}</div>)
    })

    it('should render section title and VoiceOfCustomerNavbarView', () => {
        render(<VoiceOfCustomerNavbarContainer />)

        expect(NavbarMock).toHaveBeenCalledWith(
            expect.objectContaining({ title: VOICE_OF_CUSTOMER_SECTION_NAME }),
            {},
        )
        expect(VoiceOfCustomerNavbarViewMock).toHaveBeenCalled()
    })
})
