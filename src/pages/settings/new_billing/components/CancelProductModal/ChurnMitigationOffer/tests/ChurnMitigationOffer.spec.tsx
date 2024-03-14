import {render} from '@testing-library/react'
import React from 'react'
import ChurnMitigationOffer from '../ChurnMitigationOffer'

describe('ChurnMitigationOffer', () => {
    it('should render with candu content contents', () => {
        const canduContentId = '5f5e3e3e4f3e4e001f3e4e4f'
        const {container} = render(
            <ChurnMitigationOffer canduContentId={canduContentId} />
        )
        expect(
            container.querySelector(`[data-candu-id="${canduContentId}"]`)
        ).toBeInTheDocument()
    })

    it('should render with no candu content', () => {
        const {container} = render(
            <ChurnMitigationOffer canduContentId={null} />
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
