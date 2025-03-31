import { render } from '@testing-library/react'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCreateCustomFieldDefinition } from 'custom-fields/hooks/queries/useCreateCustomFieldDefinition'
import { ticketNumberFieldDefinition } from 'fixtures/customField'
import history from 'pages/history'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'
import { assumeMock } from 'utils/testing'

import AddFieldForm from '../AddFieldForm'
import FieldForm from '../FieldForm'

jest.mock('custom-fields/hooks/queries/useCreateCustomFieldDefinition')

jest.mock('pages/history', () => ({
    ...jest.requireActual<Record<string, unknown>>('pages/history'),
    push: jest.fn(() => jest.fn()),
}))

jest.mock('../FieldForm', () => jest.fn(() => <div>FieldForm</div>))

const useCreateCustomFieldDefinitionMock = assumeMock(
    useCreateCustomFieldDefinition,
)
const FieldFormMock = assumeMock(FieldForm)

describe('<AddFieldForm/>', () => {
    const mutateAsync = jest.fn(() => Promise.resolve())
    beforeEach(() => {
        useCreateCustomFieldDefinitionMock.mockReturnValue({
            mutateAsync,
        } as unknown as ReturnType<typeof useCreateCustomFieldDefinition>)
    })

    it('should call FieldForm with correct props', () => {
        render(<AddFieldForm objectType={OBJECT_TYPES.TICKET} />)

        expect(FieldForm).toHaveBeenCalledWith(
            expect.objectContaining({
                field: {
                    object_type: OBJECT_TYPES.TICKET,
                    label: '',
                    required: false,
                    managed_type: null,
                    definition: {
                        data_type: 'text',
                        input_settings: {
                            input_type: 'dropdown',
                            choices: [],
                        },
                    },
                },
                submitLabel: 'Create field',
                onSubmit: expect.any(Function),
                onClose: expect.any(Function),
            }),
            {},
        )
    })

    it('should call mutate async with proper field', () => {
        render(<AddFieldForm objectType={OBJECT_TYPES.TICKET} />)

        FieldFormMock.mock.calls[0][0].onSubmit(ticketNumberFieldDefinition)

        expect(mutateAsync).toHaveBeenCalledWith([ticketNumberFieldDefinition])
    })

    it('should call history push when calling onClose prop', () => {
        render(<AddFieldForm objectType={OBJECT_TYPES.CUSTOMER} />)

        FieldFormMock.mock.calls[0][0].onClose()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            `/app/settings/${CUSTOM_FIELD_ROUTES[OBJECT_TYPES.CUSTOMER]}`,
        )
    })
})
