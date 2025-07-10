import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { FormField } from 'core/forms'
import { SETTING_TYPE_BUSINESS_HOURS } from 'state/currentAccount/constants'
import { renderWithStore } from 'utils/testing'

import CreateCustomBusinessHoursForm from '../CreateCustomBusinessHoursForm'

jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => () => (
    <div>Form Unsaved Changes Prompt</div>
))

describe('CreateCustomBusinessHoursForm', () => {
    it('should render the form with children and unsaved changes prompt', () => {
        renderWithStore(
            <CreateCustomBusinessHoursForm onSubmit={jest.fn()}>
                <div>Form Content</div>
            </CreateCustomBusinessHoursForm>,
            {},
        )

        expect(screen.getByRole('form')).toBeInTheDocument()
        expect(screen.getByText('Form Content')).toBeInTheDocument()
        expect(
            screen.getByText('Form Unsaved Changes Prompt'),
        ).toBeInTheDocument()
    })

    it('should pre-populate the form with the default values', () => {
        renderWithStore(
            <CreateCustomBusinessHoursForm onSubmit={jest.fn()}>
                <FormField
                    name="business_hours_config.timezone"
                    label="Timezone"
                />
            </CreateCustomBusinessHoursForm>,
            {
                currentAccount: fromJS({
                    settings: [
                        {
                            type: SETTING_TYPE_BUSINESS_HOURS,
                            data: {
                                timezone: 'America/New_York',
                            },
                        },
                    ],
                }),
            },
        )

        expect(screen.getByLabelText('Timezone')).toHaveValue(
            'America/New_York',
        )
    })
})
