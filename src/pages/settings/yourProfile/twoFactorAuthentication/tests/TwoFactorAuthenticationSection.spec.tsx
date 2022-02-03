import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import TwoFactorAuthenticationSection from '../TwoFactorAuthenticationSection'

describe('<TwoFactorAuthenticationSection />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should render the Two-Factor Authentication Section', () => {
            const {baseElement} = render(<TwoFactorAuthenticationSection />)
            expect(baseElement).toMatchSnapshot()
        })

        it('should open the Two-Factor Authentication Modal', async () => {
            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationSection />
            )

            const button = await findByText(/Enable Two-Factor Authentication/)
            fireEvent.click(button)

            expect(baseElement).toMatchSnapshot()
        })
    })
})
