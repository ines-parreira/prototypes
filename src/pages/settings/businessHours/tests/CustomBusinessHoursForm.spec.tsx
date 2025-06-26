import { render, screen } from '@testing-library/react'

import CustomBusinessHoursForm from '../CustomBusinessHoursForm'

jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => () => (
    <div>Form Unsaved Changes Prompt</div>
))

describe('CustomBusinessHoursForm', () => {
    it('should render the form with children and unsaved changes prompt', () => {
        render(
            <CustomBusinessHoursForm onSubmit={jest.fn()}>
                <div>Form Content</div>
            </CustomBusinessHoursForm>,
        )

        expect(screen.getByRole('form')).toBeInTheDocument()
        expect(screen.getByText('Form Content')).toBeInTheDocument()
        expect(
            screen.getByText('Form Unsaved Changes Prompt'),
        ).toBeInTheDocument()
    })
})
