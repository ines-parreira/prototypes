import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import TwoFactorAuthenticationSection from '../TwoFactorAuthenticationSection'
import {OwnProps} from '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'

jest.mock(
    '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal',
    () => (props: OwnProps) => {
        const openClass = props.isOpen ? 'Open' : 'Closed'
        return (
            <div className={openClass}>TwoFactorAuthenticationModal mocked</div>
        )
    }
)

describe('<TwoFactorAuthenticationSection />', () => {
    describe('render()', () => {
        it('should render the Two-Factor Authentication Section', () => {
            const {baseElement} = render(<TwoFactorAuthenticationSection />)

            expect(baseElement).toMatchSnapshot()
        })

        it('should open the Two-Factor Authentication Modal', async () => {
            const {baseElement, findByText} = render(
                <TwoFactorAuthenticationSection />
            )

            const button = await findByText(/Enable Two-Factor Authentication/)
            fireEvent.click(button)

            expect(baseElement).toMatchSnapshot()
        })
    })
})
