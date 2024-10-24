import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

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
    }

    it('calls onMessageHtmlChange when a step is submitted', () => {
        const onMessageHtmlChangeMock = jest.fn()

        render(
            <ContactCaptureFormPreview
                form={mockForm}
                onMessageHtmlChange={onMessageHtmlChangeMock}
                emailDisclaimerSettings={{
                    enabled: true,
                    disclaimer: {en: 'foo'},
                    disclaimer_default_accepted: true,
                }}
                defaultLanguage="en-US"
            />
        )

        const submitButton = screen.getByText('Submit Step')
        expect(submitButton).toBeInTheDocument()

        fireEvent.click(submitButton)

        expect(onMessageHtmlChangeMock).toHaveBeenCalledTimes(1)
    })

    it('renders the component with non expected values', () => {
        render(
            <ContactCaptureFormPreview
                form={mockForm}
                onMessageHtmlChange={undefined}
                emailDisclaimerSettings={undefined}
                defaultLanguage={'en-US'}
            />
        )

        render(
            <ContactCaptureFormPreview
                form={mockForm}
                onMessageHtmlChange={undefined}
                emailDisclaimerSettings={{
                    enabled: true,
                    disclaimer: {'': 'foo'},
                    disclaimer_default_accepted: true,
                }}
                defaultLanguage={undefined}
            />
        )
    })
})
