import { render } from '@testing-library/react'

import { Navbar } from 'common/navigation'
import { VoiceOfCustomerNavbarContainer } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarContainer'
import { VoiceOfCustomerNavbarView } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarView'
import { assumeMock } from 'utils/testing'

import { VOICE_OF_CUSTOMER_SECTION_NAME } from '../utils'

jest.mock('common/navigation')
const NavbarMock = assumeMock(Navbar)
jest.mock('pages/stats/voice-of-customer/VoiceOfCustomerNavbarView')
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
