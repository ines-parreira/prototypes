import {screen, render} from '@testing-library/react'
import React from 'react'

import {OBJECT_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinition} from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import {CustomField} from 'custom-fields/types'
import {
    aiManagedTicketInputFieldDefinition,
    productManagedTicketInputFieldDefinition,
    managedTicketInputFieldDefinition,
    ticketInputFieldDefinition,
    managedCustomerInputFieldDefinition,
} from 'fixtures/customField'
import EditCustomField from 'pages/settings/customFields/EditCustomField'
import {assumeMock} from 'utils/testing'

import EditFieldForm from '../components/EditFieldForm'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: () => ({id: 10}),
    Link: () => 'link',
}))
jest.mock('../components/EditFieldForm', () =>
    jest.fn(() => <div>They see me rollin', they hatiiin'</div>)
)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')
const useCustomFieldDefinitionMock = assumeMock(useCustomFieldDefinition)

function setTicketFieldDefinition(definition: CustomField) {
    useCustomFieldDefinitionMock.mockReturnValue({
        data: definition,
    } as ReturnType<typeof useCustomFieldDefinition>)
}

describe('<EditCustomField/>', () => {
    beforeEach(() => {
        setTicketFieldDefinition(ticketInputFieldDefinition)
    })

    it('should provide EditFieldForm with fields returned from query hook', () => {
        render(<EditCustomField objectType={OBJECT_TYPES.TICKET} />)

        expect(useCustomFieldDefinition).toHaveBeenCalledWith(10)
        expect(EditFieldForm).toHaveBeenCalledWith(
            {field: ticketInputFieldDefinition},
            {}
        )
    })

    it('should render no text when field is not a managed field', () => {
        render(<EditCustomField objectType={OBJECT_TYPES.TICKET} />)
        expect(
            screen.queryByText(/This field is managed/)
        ).not.toBeInTheDocument()
        expect(screen.queryByText(/Use this field/)).not.toBeInTheDocument()
    })

    it('should render text for AI managed field', () => {
        setTicketFieldDefinition(aiManagedTicketInputFieldDefinition)
        render(<EditCustomField objectType={OBJECT_TYPES.TICKET} />)
        expect(screen.queryByText(/Use this field/)).not.toBeInTheDocument()
        expect(screen.getByText(/This field is managed/)).toBeInTheDocument()
    })

    it('should render link for ticket managed field', () => {
        setTicketFieldDefinition(managedCustomerInputFieldDefinition)
        render(<EditCustomField objectType={OBJECT_TYPES.CUSTOMER} />)
        expect(
            screen.getByText('see this article').getAttribute('href')
        ).toEqual('https://link.gorgias.com/tjj')
    })

    it('should render text for contact_reason managed field', () => {
        setTicketFieldDefinition(managedTicketInputFieldDefinition)
        render(<EditCustomField objectType={OBJECT_TYPES.TICKET} />)
        expect(screen.getByText(/Use this field /))
        expect(screen.findByText(/This field is powered /))
        expect(
            screen.getByText('see this article').getAttribute('href')
        ).toEqual('https://docs.gorgias.com/en-US/managed-ticket-fields-273001')
    })

    it('should render text for non contact_reason managed field', () => {
        setTicketFieldDefinition(productManagedTicketInputFieldDefinition)
        render(<EditCustomField objectType={OBJECT_TYPES.TICKET} />)

        expect(
            screen.queryByText(/This field is powered /)
        ).not.toBeInTheDocument()

        expect(screen.getByText(/For more details/)).toBeInTheDocument()
        expect(screen.getByText('see this article')).toBeInTheDocument()
    })
})
