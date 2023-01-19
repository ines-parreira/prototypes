import {cleanup, render} from '@testing-library/react'
import React from 'react'
import VerificationCard from '../VerificationCard/VerificationCard'

describe('Verification Card', () => {
    afterEach(cleanup)

    it('should be interactive and display Verified when isVerified=true', () => {
        const {container} = render(
            <VerificationCard
                header="Header"
                body="Body"
                bodyActions="Actions"
                footer="Footer"
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
