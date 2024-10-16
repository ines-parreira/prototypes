import {render, screen} from '@testing-library/react'
import React from 'react'
import {VerificationChargeDisclaimer} from './VerificationChargeDisclaimer'

describe('VerificationChargeDisclaimer', () => {
    it('should display the one dollar charge disclaimer', () => {
        render(<VerificationChargeDisclaimer />)

        expect(screen.getByText('A temporary $1 charge')).toBeVisible()
        expect(
            screen.getByText('will be applied to new payment methods, and be')
        ).toBeVisible()
        expect(screen.getByText('refunded within 7 days.')).toBeVisible()
    })
})
