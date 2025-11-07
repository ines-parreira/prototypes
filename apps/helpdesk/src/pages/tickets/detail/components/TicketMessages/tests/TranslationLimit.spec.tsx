import { act, render, screen } from '@testing-library/react'

import { TranslationLimit } from '../TranslationLimit'

describe('TranslationLimit', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers()
        })
        jest.useRealTimers()
    })

    it('should render the error message initially', () => {
        render(<TranslationLimit />)

        expect(
            screen.getByText('Regeneration limit reached'),
        ).toBeInTheDocument()
    })

    it('should hide the error message after 5 seconds', () => {
        render(<TranslationLimit />)

        expect(
            screen.getByText('Regeneration limit reached'),
        ).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(5000)
        })

        expect(
            screen.queryByText('Regeneration limit reached'),
        ).not.toBeInTheDocument()
    })

    it('should still be visible before 5 seconds', () => {
        render(<TranslationLimit />)

        act(() => {
            jest.advanceTimersByTime(4999)
        })

        expect(
            screen.getByText('Regeneration limit reached'),
        ).toBeInTheDocument()
    })
})
