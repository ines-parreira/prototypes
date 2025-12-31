import { Form } from '@repo/forms'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { SLAPolicyMetricUnit } from '@gorgias/helpdesk-types'

import TimeUnitSelectField from '../TimeUnitSelectField'

describe('TimeUnitSelectField', () => {
    it('should pass correct inputTransform and outputTransform', async () => {
        const user = userEvent.setup()

        render(
            <Form
                onValidSubmit={jest.fn()}
                defaultValues={{
                    testUnit: SLAPolicyMetricUnit.Hour,
                }}
            >
                <TimeUnitSelectField name="testUnit" />
            </Form>,
        )

        expect((screen.getByRole('textbox') as HTMLSelectElement).value).toBe(
            'Hours',
        )

        await act(() => user.click(screen.getAllByDisplayValue('Hours')[0]))
        await act(() =>
            user.click(screen.getByRole('option', { name: 'Days' })),
        )

        await waitFor(() => {
            expect(
                (screen.getByRole('textbox') as HTMLSelectElement).value,
            ).toBe('Days')
        })
    })
})
