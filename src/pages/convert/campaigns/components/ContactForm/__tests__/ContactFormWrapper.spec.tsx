import React from 'react'
import {act, render} from '@testing-library/react'
import ContactForm from 'pages/convert/campaigns/components/ContactForm/ContactFormWrapper'
import Wizard from 'pages/common/components/wizard/Wizard'
import {STEPS} from 'pages/convert/campaigns/components/ContactForm/steps'

describe('<ContactFormWrapper />', () => {
    it('should have the correct behavior for step navigation buttons', () => {
        const mockOnSubmit = jest.fn()
        const mockOnCancel = jest.fn()
        const mockOnReset = jest.fn()
        const {getByText} = render(
            <Wizard steps={STEPS.map((step) => step.label)}>
                <ContactForm
                    open
                    onOpenChange={() => {}}
                    onCancel={mockOnCancel}
                    onSubmit={mockOnSubmit}
                    onReset={mockOnReset}
                />
            </Wizard>
        )

        // It is expected to start at the first step
        const cancelBtn = getByText('Cancel')
        expect(cancelBtn).not.toBeUndefined()

        act(() => cancelBtn.click())
        expect(mockOnCancel).toHaveBeenCalled()

        let nextButton = getByText('Next')

        act(() => nextButton.click())
        // Now it should render previous and next
        nextButton = getByText('Next')
        let previousButton = getByText('Previous')
        expect(previousButton).not.toBeUndefined()
        expect(nextButton).not.toBeUndefined()

        act(() => nextButton.click())
        // Now it should render the submit action and previous
        const submitButton = getByText('Add Form')
        previousButton = getByText('Previous')
        expect(submitButton).not.toBeUndefined()
        expect(previousButton).not.toBeUndefined()

        act(() => submitButton.click())
        expect(mockOnSubmit).toHaveBeenCalled()

        const resetButton = getByText('Reset')
        act(() => resetButton.click())
        expect(mockOnReset).toBeCalled()

        // Navigate back again to test back navigation
        previousButton = getByText('Previous')
        act(() => previousButton.click())
        previousButton = getByText('Previous')
        nextButton = getByText('Next')
        expect(previousButton).not.toBeUndefined()
        expect(nextButton).not.toBeUndefined()
    })
})
