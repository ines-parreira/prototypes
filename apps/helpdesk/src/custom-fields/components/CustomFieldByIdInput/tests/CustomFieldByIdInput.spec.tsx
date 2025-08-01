import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import CustomFieldInput from 'custom-fields/components/CustomFieldInput'
import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { ticketInputFieldDefinition } from 'fixtures/customField'

import CustomFieldByIdInput from '../CustomFieldByIdInput'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = assumeMock(useCustomFieldDefinition)

jest.mock('custom-fields/components/CustomFieldInput', () => {
    return jest.fn(() => <div>CustomFieldInput</div>)
})

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

describe('<CustomFieldIdInput/>', () => {
    const baseProps = {
        customFieldId: ticketInputFieldDefinition.id,
        onChange: jest.fn(),
    }
    beforeEach(() => {
        useCustomFieldDefinitionMock.mockReturnValue({
            data: ticketInputFieldDefinition,
            isLoading: false,
        } as any)
    })

    it('should render loader if custom field is loading', () => {
        useCustomFieldDefinitionMock.mockReturnValue({
            isLoading: true,
        } as any)

        const { getByText } = render(<CustomFieldByIdInput {...baseProps} />)

        expect(getByText('Loader')).toBeInTheDocument()
    })

    it('should render info if custom field data is missing', () => {
        useCustomFieldDefinitionMock.mockReturnValue({
            data: undefined,
        } as any)

        const { getByText } = render(<CustomFieldByIdInput {...baseProps} />)

        expect(getByText('Missing custom field')).toBeInTheDocument()
    })

    it('should render', () => {
        render(<CustomFieldByIdInput {...baseProps} />)

        expect(CustomFieldInput).toHaveBeenCalledWith(
            expect.objectContaining({
                id: String(ticketInputFieldDefinition.id),
                field: ticketInputFieldDefinition,
                onChange: expect.any(Function),
            }),
            expect.any(Object),
        )
    })
})
