import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useUpdateCustomFieldDefinition } from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinition'
import { ticketNumberFieldDefinition } from 'fixtures/customField'
import history from 'pages/history'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'

import EditFieldForm from '../EditFieldForm'
import FieldForm from '../FieldForm'

jest.mock('custom-fields/hooks/queries/useUpdateCustomFieldDefinition')

jest.mock('pages/history', () => ({
    ...jest.requireActual<Record<string, unknown>>('pages/history'),
    push: jest.fn(() => jest.fn()),
}))

jest.mock('../FieldForm', () => jest.fn(() => <div>FieldForm</div>))

const useUpdateCustomFieldDefinitionMock = assumeMock(
    useUpdateCustomFieldDefinition,
)
const FieldFormMock = assumeMock(FieldForm)

describe('<EditFieldForm/>', () => {
    const mutateAsync = jest.fn(() => Promise.resolve())
    beforeEach(() => {
        useUpdateCustomFieldDefinitionMock.mockReturnValue({
            mutateAsync,
        } as unknown as ReturnType<typeof useUpdateCustomFieldDefinition>)
    })

    it('should call FieldForm with correct props', () => {
        render(<EditFieldForm field={ticketNumberFieldDefinition} />)

        expect(FieldForm).toHaveBeenCalledWith(
            {
                field: expect.objectContaining(ticketNumberFieldDefinition),
                onSubmit: expect.any(Function),
                onClose: expect.any(Function),
            },
            {},
        )
    })

    it('should call mutate async with proper field', () => {
        render(<EditFieldForm field={ticketNumberFieldDefinition} />)

        FieldFormMock.mock.calls[0][0].onSubmit(ticketNumberFieldDefinition)

        expect(mutateAsync).toHaveBeenCalledWith({
            id: ticketNumberFieldDefinition.id,
            data: ticketNumberFieldDefinition,
        })
    })

    it('should call history push when calling onClose prop', () => {
        render(<EditFieldForm field={ticketNumberFieldDefinition} />)

        FieldFormMock.mock.calls[0][0].onClose()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            `/app/settings/${CUSTOM_FIELD_ROUTES[ticketNumberFieldDefinition.object_type]}`,
        )
    })
})
