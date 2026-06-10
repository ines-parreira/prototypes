import { screen } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { useTicketFieldsStore } from './InfobarTicketFields/store/useTicketFieldsStore'
import type { FieldEventHandlerParams } from './InfobarTicketFields/utils/constants'
import { TicketInfobarTicketFields } from './TicketInfobarTicketFields'

const {
    mockFieldId,
    mockNumberVisibleField,
    mockUpdateOrDeleteCustomerFieldValue,
} = vi.hoisted(() => {
    const fieldId = 2
    const fieldDefinition = {
        id: fieldId,
        label: 'Priority',
        object_type: 'Ticket',
        required: false,
        requirement_type: 'visible',
        definition: {
            data_type: 'number',
            input_settings: {
                input_type: 'input_number',
                min: 1,
                max: 1000000000,
                placeholder: 'Enter priority',
            },
        },
    } as FieldEventHandlerParams['field']['fieldDefinition']

    return {
        mockFieldId: fieldId,
        mockNumberVisibleField: {
            fieldDefinition,
            isRequired: false,
        } as FieldEventHandlerParams['field'],
        mockUpdateOrDeleteCustomerFieldValue: vi.fn(),
    }
})

vi.mock(
    './InfobarTicketFields/hooks/useUpdateOrDeleteTicketFieldValue',
    () => ({
        useUpdateOrDeleteTicketFieldValue: () => ({
            updateOrDeleteCustomerFieldValue:
                mockUpdateOrDeleteCustomerFieldValue,
        }),
    }),
)

vi.mock('./InfobarTicketFields/store/useInitializeTicketFieldsStore', () => ({
    useInitializeTicketFieldsStore: () => ({ isLoading: false }),
}))

// The child field list has its own MSW-backed coverage. This harness keeps
// the parent save/dedupe branch deterministic in package-wide runs.
vi.mock('./InfobarTicketFields/InfobarTicketFields', () => ({
    InfobarTicketFields: ({
        onFieldChange,
        onFieldBlur,
    }: {
        onFieldChange: (params: FieldEventHandlerParams) => void
        onFieldBlur: (params: FieldEventHandlerParams) => void
    }) => (
        <>
            <button
                type="button"
                onClick={() =>
                    onFieldChange({
                        field: mockNumberVisibleField,
                        nextValue: 42,
                    })
                }
            >
                Change number
            </button>
            <button
                type="button"
                onClick={() =>
                    onFieldBlur({
                        field: mockNumberVisibleField,
                        nextValue: 42,
                    })
                }
            >
                Blur number
            </button>
        </>
    ),
}))

afterEach(() => {
    useTicketFieldsStore.getState().resetFields()
    mockUpdateOrDeleteCustomerFieldValue.mockReset()
})

describe('TicketInfobarTicketFields', () => {
    it('saves a changed existing number field value and skips an unchanged blur', async () => {
        useTicketFieldsStore.getState().initializeFields({
            [mockFieldId]: { id: mockFieldId, value: 4 },
        })

        const { user } = render(<TicketInfobarTicketFields ticketId="123" />)

        await user.click(screen.getByRole('button', { name: 'Change number' }))

        expect(useTicketFieldsStore.getState().fields[mockFieldId]?.value).toBe(
            42,
        )
        expect(mockUpdateOrDeleteCustomerFieldValue).toHaveBeenCalledTimes(1)
        expect(mockUpdateOrDeleteCustomerFieldValue).toHaveBeenCalledWith({
            fieldId: mockFieldId,
            value: 42,
        })

        await user.click(screen.getByRole('button', { name: 'Blur number' }))

        expect(mockUpdateOrDeleteCustomerFieldValue).toHaveBeenCalledTimes(1)
    })
})
