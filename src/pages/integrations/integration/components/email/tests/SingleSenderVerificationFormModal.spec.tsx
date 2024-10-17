import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import SingleSenderVerificationFormModal from '../EmailMigration/SingleSenderVerificationFormModal'
import VerificationForm, {
    FORM_ID,
} from '../EmailOutboundVerification/VerificationForm/VerificationForm'

jest.mock(
    '../EmailOutboundVerification/VerificationForm/VerificationForm',
    () =>
        ({
            ...jest.requireActual(
                '../EmailOutboundVerification/VerificationForm/VerificationForm'
            ),
            default: (props: ComponentProps<typeof VerificationForm>) => (
                <div data-testid="verification-form">
                    <button
                        data-testid="submit-button"
                        onClick={() => props.onSubmit?.({} as any)}
                    />
                </div>
            ),
        }) as Record<any, any>
)

describe('SingleSenderVerificationFormModal', () => {
    const props = {
        setIsOpen: jest.fn(),
        onConfirm: jest.fn(),
        isOpen: true,
    }
    const renderComponent = () =>
        render(<SingleSenderVerificationFormModal {...props} />)

    afterEach(cleanup)

    it('should render verification form and close and submit buttons', () => {
        renderComponent()

        /* verification form */
        expect(screen.getByTestId(/verification-form/i)).toBeVisible()

        /* should call setIsOpen(false) when clicking close button */
        fireEvent.click(screen.getByRole('button', {name: /close/i}))
        expect(props.setIsOpen).toHaveBeenCalledWith(false)

        /* submit button should submit form */
        const submitButton = screen.getByRole('button', {name: /submit/i})
        expect(submitButton).toHaveAttribute('form', FORM_ID)
        expect(submitButton).toHaveAttribute('type', 'submit')

        /* clicking submit button inside the form should call onConfirm */
        fireEvent.click(screen.getByTestId('submit-button'))
        expect(props.onConfirm).toHaveBeenCalled()
    })
})
