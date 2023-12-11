import React from 'react'
import {render} from '@testing-library/react'
import {ticketFieldDefinitions} from 'fixtures/customField'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {assumeMock} from 'utils/testing'
import CustomFieldSelect from '../CustomFieldSelect'

jest.mock('hooks/customField/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

describe('<CustomFieldSelect/>', () => {
    it('should render', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as any)

        const {container} = render(
            <CustomFieldSelect onChange={jest.fn()} value={null} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
