import React from 'react'
import {screen, render} from '@testing-library/react'

import EditCustomField from 'pages/settings/customFields/EditCustomField'
import {useCustomFieldDefinition} from 'hooks/customField/useCustomFieldDefinition'
import {
    aiManagedTicketInputFieldDefinition,
    productManagedTicketInputFieldDefinition,
    managedTicketInputFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import {assumeMock} from 'utils/testing'
import {CustomField} from 'models/customField/types'

import EditFieldForm from '../components/EditFieldForm'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: () => ({id: 10}),
    Link: () => 'link',
}))
jest.mock('../components/EditFieldForm', () =>
    jest.fn(() => <div>They see me rollin', they hatiiin'</div>)
)
jest.mock('hooks/customField/useCustomFieldDefinition')
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
        render(<EditCustomField />)

        expect(useCustomFieldDefinition).toHaveBeenCalledWith(10)
        expect(EditFieldForm).toHaveBeenCalledWith(
            {field: ticketInputFieldDefinition},
            {}
        )
    })

    it('should render no text when field is not a managed field', () => {
        render(<EditCustomField />)
        expect(
            screen.queryByText(/This field is managed/)
        ).not.toBeInTheDocument()
        expect(screen.queryByText(/Use this field/)).not.toBeInTheDocument()
    })

    it('should render text for AI managed field', () => {
        setTicketFieldDefinition(aiManagedTicketInputFieldDefinition)
        render(<EditCustomField />)
        expect(screen.queryByText(/Use this field/)).not.toBeInTheDocument()
        expect(screen.getByText(/This field is managed/)).toBeInTheDocument()
    })

    it('should render text for contact_reason managed field', () => {
        setTicketFieldDefinition(managedTicketInputFieldDefinition)
        render(<EditCustomField />)
        expect(screen.getByText(/Use this field /))
        expect(screen.findByText(/This field is powered /))
        expect(
            screen.getByText('see this article').getAttribute('href')
        ).toEqual(
            'https://docs.gorgias.com/en-US/273001-a7d86899ce5f4aef81ebbaa301d78b58'
        )
    })

    it('should render text for non contact_reason managed field', () => {
        setTicketFieldDefinition(productManagedTicketInputFieldDefinition)
        render(<EditCustomField />)

        expect(
            screen.queryByText(/This field is powered /)
        ).not.toBeInTheDocument()

        expect(screen.getByText(/For more details/)).toBeInTheDocument()
        expect(screen.getByText('see this article')).toBeInTheDocument()
    })
})
