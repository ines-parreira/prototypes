import React from 'react'

import {render, screen, fireEvent} from '@testing-library/react'
import {ContactCaptureFormPreview} from '../ContactCaptureFormPreview'
import {ContactCaptureStepProps} from '../ContactCaptureStep'

jest.mock('../ContactCaptureStep', () => ({
    ContactCaptureStep: ({onSubmit}: ContactCaptureStepProps) => (
        <button onClick={() => onSubmit({})}>Submit Step</button>
    ),
}))

describe('ContactCaptureFormPreview', () => {
    const mockForm = {
        steps: [
            {
                cta: 'Next',
                fields: [],
            },
        ],
        on_success_content: {
            message: 'Success!',
        },
        targets: [],
        disclaimer: 'Test disclaimer',
        disclaimer_default_accepted: false,
    }

    it('calls onMessageHtmlChange when a step is submitted', () => {
        const onMessageHtmlChangeMock = jest.fn()

        render(
            <ContactCaptureFormPreview
                form={mockForm}
                onMessageHtmlChange={onMessageHtmlChangeMock}
            />
        )

        const submitButton = screen.getByText('Submit Step')
        expect(submitButton).toBeInTheDocument()

        fireEvent.click(submitButton)

        expect(onMessageHtmlChangeMock).toHaveBeenCalledTimes(1)
    })
})
