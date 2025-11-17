import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { FormField } from 'core/forms'
import { SETTING_TYPE_BUSINESS_HOURS } from 'state/currentAccount/constants'
import { renderWithStore } from 'utils/testing'

import CreateCustomBusinessHoursForm from '../CreateCustomBusinessHoursForm'
import type { CustomBusinessHoursContextState } from '../CustomBusinessHoursContext'
import { CustomBusinessHoursContext } from '../CustomBusinessHoursContext'

jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => () => (
    <div>Form Unsaved Changes Prompt</div>
))

const onSubmit = jest.fn()

const renderComponent = (
    children: React.ReactNode,
    providerValue: Partial<CustomBusinessHoursContextState> = {
        integrationsToOverride: [],
    },
    storeState: Record<string, any> = {},
) => {
    return renderWithStore(
        <CustomBusinessHoursContext.Provider
            value={providerValue as CustomBusinessHoursContextState}
        >
            <CreateCustomBusinessHoursForm onSubmit={onSubmit}>
                {children}
            </CreateCustomBusinessHoursForm>
        </CustomBusinessHoursContext.Provider>,
        storeState,
    )
}

describe('CreateCustomBusinessHoursForm', () => {
    it('should render the form with children and unsaved changes prompt', () => {
        renderComponent(<div>Form Content</div>)

        expect(screen.getByRole('form')).toBeInTheDocument()
        expect(screen.getByText('Form Content')).toBeInTheDocument()
        expect(
            screen.getByText('Form Unsaved Changes Prompt'),
        ).toBeInTheDocument()
    })

    it('should pre-populate the form with the default values', () => {
        renderComponent(
            <FormField
                name="business_hours_config.timezone"
                label="Timezone"
            />,
            undefined,
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

    it('should validate the form', async () => {
        const user = userEvent.setup()

        renderComponent(
            <div>
                <FormField
                    name="overrideConfirmation"
                    label="Override confirmation"
                />
                <button type="submit">Submit</button>
            </div>,
            {
                integrationsToOverride: [],
            },
        )

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Submit' }))
        })

        // form is not submitted because the overrideConfirmation is not true
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should remove overrideConfirmation from the payload when submitting', async () => {
        const user = userEvent.setup()

        renderComponent(
            <div>
                <FormField
                    name="overrideConfirmation"
                    label="Override confirmation"
                />
                <FormField name="name" label="Name" />
                <button type="submit">Submit</button>
            </div>,
            {
                integrationsToOverride: [],
            },
        )

        await act(async () => {
            await user.type(screen.getByLabelText('Name'), 'Test')
            await user.click(screen.getByLabelText('Override confirmation'))
        })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Submit' }))
        })

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled()
        })

        expect(onSubmit).not.toHaveBeenCalledWith(
            expect.objectContaining({
                overrideConfirmation: expect.any,
            }),
        )
    })
})
