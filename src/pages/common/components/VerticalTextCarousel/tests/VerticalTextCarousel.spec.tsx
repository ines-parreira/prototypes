import React from 'react'

import { render, screen } from '@testing-library/react'

import { VerticalTextCarousel } from '../VerticalTextCarousel'

describe('VerticalTextCarousel', () => {
    it('should render texts and CTA', () => {
        render(
            <VerticalTextCarousel
                texts={['text1', 'text2']}
                cta={<button>CTA</button>}
            />,
        )

        expect(screen.getByText('text1')).toBeInTheDocument()
        expect(screen.queryByText('text2')).not.toBeInTheDocument()
        expect(screen.getByText('CTA')).toBeInTheDocument()
    })

    it('should not render if texts are empty', () => {
        const { container } = render(<VerticalTextCarousel texts={[]} />)

        expect(container.firstChild).toBeNull()
    })

    it('should render next text', () => {
        render(<VerticalTextCarousel texts={['text1', 'text2', 'text3']} />)

        const nextButton = screen.getByLabelText('Next')
        nextButton.click()

        expect(screen.queryByText('text1')).not.toBeInTheDocument()
        expect(screen.getByText('text2')).toBeInTheDocument()
        expect(screen.queryByText('text3')).not.toBeInTheDocument()

        // to test that it wraps around in cycle
        nextButton.click()
        nextButton.click()
        expect(screen.getByText('text1')).toBeInTheDocument()
    })

    it('should render prev text', () => {
        render(<VerticalTextCarousel texts={['text1', 'text2', 'text3']} />)

        const prevButton = screen.getByLabelText('Previous')
        prevButton.click()

        // tests that it wraps around in cycle
        expect(screen.queryByText('text1')).not.toBeInTheDocument()
        expect(screen.queryByText('text2')).not.toBeInTheDocument()
        expect(screen.getByText('text3')).toBeInTheDocument()
    })

    it('should handle CTA click', () => {
        const onCtaClick = jest.fn()
        render(
            <VerticalTextCarousel
                texts={['text1', 'text2', 'text3']}
                cta={<button>CTA</button>}
                ctaSuccessMessage={'Successful CTA click'}
                onCtaClick={onCtaClick}
            />,
        )

        // move to the 2nd suggestion
        const nextButton = screen.getByLabelText('Next')
        nextButton.click()

        const ctaButton = screen.getByText('CTA')
        ctaButton.click()

        expect(onCtaClick).toHaveBeenCalledWith('text2')
        expect(screen.getByText('Successful CTA click')).toBeInTheDocument()
    })
})
