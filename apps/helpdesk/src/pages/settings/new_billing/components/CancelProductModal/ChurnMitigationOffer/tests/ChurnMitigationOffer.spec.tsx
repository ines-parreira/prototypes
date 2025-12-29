import React from 'react'

import { render } from '@testing-library/react'

import ChurnMitigationOffer from '../ChurnMitigationOffer'

describe('ChurnMitigationOffer', () => {
    it('should render with candu content contents', () => {
        const canduContentId = '5f5e3e3e4f3e4e001f3e4e4f'
        const { container } = render(
            <ChurnMitigationOffer canduContentId={canduContentId} />,
        )
        expect(
            container.querySelector(`[data-candu-id="${canduContentId}"]`),
        ).toBeInTheDocument()
    })

    it('should render with no candu content', () => {
        const { container } = render(
            <ChurnMitigationOffer canduContentId={null} />,
        )

        const defaultTextElement = container.querySelector('.container')
        expect(defaultTextElement).toBeInTheDocument()
        expect(defaultTextElement).toHaveTextContent(
            'We get it--your business is unique. Before you cancel, our team can review your plan and offer a custom solution that fits your goals and budget.',
        )
        expect(defaultTextElement).toHaveTextContent(
            "Wheter you're scaling, testing new channels, or just need a smaller plan, we'll make sure you're getting the most value from Gorgias",
        )
        expect(defaultTextElement).toHaveTextContent(
            'Click "Get My Offer" and we\'ll reach out to discuss your personalized options--no strings attached.',
        )
    })
})
