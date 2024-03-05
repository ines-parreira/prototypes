import {render} from '@testing-library/react'
import React from 'react'
import {
    HelpdeskPrimaryReasonLabel,
    HelpdeskSecondaryReasonLabel,
} from '../../constants'
import ChurnMitigationOffer from '../ChurnMitigationOffer'

describe('ChurnMitigationOffer', () => {
    const reasonsToCanduContent = [
        {
            primaryReasonLabel: HelpdeskPrimaryReasonLabel.InternalReasons,
            secondaryReasonLabel:
                HelpdeskSecondaryReasonLabel.BusinessSlowingDown,
            canduContentID: '5f5e3e3e4f3e4e001f3e4e4f',
        },
    ]

    it('should render with candu content contents', () => {
        reasonsToCanduContent.forEach(
            ({primaryReasonLabel, secondaryReasonLabel, canduContentID}) => {
                const primaryReason = {label: primaryReasonLabel}
                const secondaryReason = secondaryReasonLabel
                    ? {label: secondaryReasonLabel}
                    : null

                const {container} = render(
                    <ChurnMitigationOffer
                        reasonsToCanduContent={reasonsToCanduContent}
                        primaryReason={primaryReason}
                        secondaryReason={secondaryReason}
                    />
                )
                expect(
                    container.querySelector(
                        `[data-candu-id="${canduContentID}"]`
                    )
                ).toBeInTheDocument()
            }
        )
    })

    it('should render with no candu content', () => {
        const {container} = render(
            <ChurnMitigationOffer
                reasonsToCanduContent={reasonsToCanduContent}
                primaryReason={{label: 'Other'}}
                secondaryReason={{label: 'Other'}}
            />
        )

        const defaultTextElement = container.querySelector('.container')
        expect(defaultTextElement).toBeInTheDocument()
        expect(defaultTextElement).toHaveTextContent(
            'Need help staying with us?Reach out to support@gorgias.com ' +
                'for a personalized churn mitigation offer!' +
                "We're here to make sure you get the most out of your experience with us. " +
                "Let's work together to keep you happy and satisfied."
        )
    })
})
