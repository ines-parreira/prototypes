import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import VerificationCardFooter from '../VerificationCard/VerificationCardFooter'

const commonProps = {
    icon: 'email',
    label: 'email@email.com',
}

describe('Verification card footer', () => {
    afterEach(cleanup)

    it('should be interactive and display Verified when isVerified=true', () => {
        const onClick = jest.fn()

        render(
            <VerificationCardFooter
                {...commonProps}
                isVerified
                onClick={onClick}
            />
        )

        expect(screen.getByText('Verified', {exact: true})).toBeTruthy()
        fireEvent.click(screen.getByTestId('verification-status-footer'))
        expect(onClick).toHaveBeenCalled()
    })

    it('should not be interactive when isVerified=false', () => {
        const onClick = jest.fn()

        render(
            <VerificationCardFooter
                {...commonProps}
                isVerified={false}
                onClick={onClick}
            />
        )

        expect(screen.getByText('Not verified', {exact: true})).toBeTruthy()

        fireEvent.click(screen.getByTestId('verification-status-footer'))
        expect(onClick).not.toHaveBeenCalled()
    })
})
