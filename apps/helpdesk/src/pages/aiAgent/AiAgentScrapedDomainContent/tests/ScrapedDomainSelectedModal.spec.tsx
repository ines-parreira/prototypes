import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import ScrapedDomainSelectedModal from '../ScrapedDomainSelectedModal'

const mockedOnBackdropClick = jest.fn()

describe('<ScrapedDomainSelectedModal/>', () => {
    const props = {
        isOpened: true,
        isLoading: false,
        onBackdropClick: mockedOnBackdropClick,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        render(
            <ScrapedDomainSelectedModal {...props}>
                Modal content
            </ScrapedDomainSelectedModal>,
        )
        expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('should trigger onBackdropClick when Esc button is clicked', () => {
        render(
            <ScrapedDomainSelectedModal {...props}>
                Modal content
            </ScrapedDomainSelectedModal>,
        )

        fireEvent.keyDown(document, {
            key: 'Escape',
        })

        expect(mockedOnBackdropClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger onBackdropClick when Esc button is clicked, if isOpened is false', () => {
        render(
            <ScrapedDomainSelectedModal {...{ ...props, isOpened: false }}>
                Modal content
            </ScrapedDomainSelectedModal>,
        )

        fireEvent.keyDown(document, {
            key: 'Escape',
        })

        expect(mockedOnBackdropClick).not.toHaveBeenCalled()
    })

    it('should apply clickThrough class to backdrop when allowClickThrough is true', () => {
        const { container } = render(
            <ScrapedDomainSelectedModal {...props} allowClickThrough={true}>
                Modal content
            </ScrapedDomainSelectedModal>,
        )

        const backdrop = container.querySelector('.backdrop')

        expect(backdrop?.classList.contains('clickThrough')).toBe(true)
    })

    it('should not apply clickThrough class to backdrop when allowClickThrough is false', () => {
        const { container } = render(
            <ScrapedDomainSelectedModal {...props} allowClickThrough={false}>
                Modal content
            </ScrapedDomainSelectedModal>,
        )

        const backdrop = container.querySelector('.backdrop')

        expect(backdrop?.classList.contains('clickThrough')).toBe(false)
    })
})
