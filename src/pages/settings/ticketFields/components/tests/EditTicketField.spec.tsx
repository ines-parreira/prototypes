import React from 'react'
import {useParams} from 'react-router-dom'
import {shallow} from 'enzyme'

import {
    ticketInputFieldDefinition,
    managedTicketInputFieldDefinition,
} from 'fixtures/customField'
import {useCustomFieldDefinition} from 'hooks/customField/useCustomFieldDefinition'
import EditTicketField from '../../EditTicketField'

jest.mock('react-router')
jest.mock('hooks/customField/useCustomFieldDefinition')

const useParamsMock = useParams as jest.Mock
const useCustomFieldDefinitionMock = useCustomFieldDefinition as jest.Mock

describe('<EditTicketField/>', () => {
    it('should render a loader', () => {
        useParamsMock.mockReturnValueOnce({id: 1})
        useCustomFieldDefinitionMock.mockReturnValueOnce({
            data: null,
            isLoading: true,
        })

        const component = shallow(<EditTicketField />)
        expect(component).toMatchSnapshot()
    })

    it('should render no info alert and the edit form because it is not a managed ticket field', () => {
        useParamsMock.mockReturnValueOnce({id: ticketInputFieldDefinition.id})
        useCustomFieldDefinitionMock.mockReturnValueOnce({
            data: ticketInputFieldDefinition,
            isLoading: false,
        })

        const component = shallow(<EditTicketField />)
        expect(component).toMatchSnapshot()
    })

    it('should render an info alert and the edit form because it is a "Contact reason" managed ticket field', () => {
        useParamsMock.mockReturnValueOnce({
            id: managedTicketInputFieldDefinition.id,
        })
        useCustomFieldDefinitionMock.mockReturnValueOnce({
            data: managedTicketInputFieldDefinition,
            isLoading: false,
        })

        const component = shallow(<EditTicketField />)
        expect(component).toMatchSnapshot()
    })
})
