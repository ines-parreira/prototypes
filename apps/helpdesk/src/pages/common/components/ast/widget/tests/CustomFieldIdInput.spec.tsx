import React from 'react'

import { assumeMock, render } from '@repo/testing'

import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { ticketInputFieldDefinition } from 'fixtures/customField'

import CustomFieldInput from '../CustomFieldIdInput'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = assumeMock(useCustomFieldDefinition)

describe('<CustomFieldIdInput/>', () => {
    it('should render', () => {
        useCustomFieldDefinitionMock.mockReturnValue({
            data: ticketInputFieldDefinition,
            isLoading: false,
        } as any)

        const { container } = render(
            <CustomFieldInput
                customFieldId={ticketInputFieldDefinition.id}
                onChange={jest.fn()}
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
