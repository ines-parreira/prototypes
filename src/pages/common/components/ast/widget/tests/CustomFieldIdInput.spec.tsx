import React from 'react'
import {render} from '@testing-library/react'
import {ticketInputFieldDefinition} from 'fixtures/customField'
import {useCustomFieldDefinition} from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import {assumeMock} from 'utils/testing'
import CustomFieldInput from '../CustomFieldIdInput'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = assumeMock(useCustomFieldDefinition)

describe('<CustomFieldIdInput/>', () => {
    it('should render', () => {
        useCustomFieldDefinitionMock.mockReturnValue({
            data: ticketInputFieldDefinition,
            isLoading: false,
        } as any)

        const {container} = render(
            <CustomFieldInput
                customFieldId={ticketInputFieldDefinition.id}
                onChange={jest.fn()}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
