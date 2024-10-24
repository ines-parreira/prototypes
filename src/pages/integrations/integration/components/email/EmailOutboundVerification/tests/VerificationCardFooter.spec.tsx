import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import VerificationCardFooter from '../VerificationCard/VerificationCardFooter'

const commonProps = {
    icon: 'email',
    label: 'email@email.com',
    onClick: jest.fn(),
}

describe('Verification card footer', () => {
    afterEach(() => {
        cleanup()
        jest.resetAllMocks()
    })

    it('should be interactive and display Verified when isVerified=true', () => {
        render(<VerificationCardFooter {...commonProps} isVerified />)

        expect(screen.getByText('Verified', {exact: true})).toBeTruthy()
        fireEvent.click(screen.getByTestId('verification-status-footer'))
        expect(commonProps.onClick).toHaveBeenCalled()
    })

    it('should not be interactive when isVerified=false', () => {
        render(<VerificationCardFooter {...commonProps} isVerified={false} />)

        expect(screen.getByText('Not verified', {exact: true})).toBeTruthy()

        fireEvent.click(screen.getByTestId('verification-status-footer'))
        expect(commonProps.onClick).not.toHaveBeenCalled()
    })

    it('should not show status when "showStatus" is false', () => {
        render(
            <VerificationCardFooter
                {...commonProps}
                isVerified={false}
                showStatus={false}
            />
        )

        expect(screen.queryByText('Not verified', {exact: true})).toBeFalsy()
    })
})
