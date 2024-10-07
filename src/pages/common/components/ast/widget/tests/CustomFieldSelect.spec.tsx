import React from 'react'
import {screen, render} from '@testing-library/react'
import {
    aiManagedTicketInputFieldDefinition,
    ticketFieldDefinitions,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {assumeMock} from 'utils/testing'
import CustomFieldSelect from '../CustomFieldSelect'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
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

    it('should render an alert if no custom field is available', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: [ticketFieldDefinitions[0]]},
            isLoading: false,
        } as any)

        render(
            <CustomFieldSelect
                onChange={jest.fn()}
                value={null}
                idsAlreadySet={[ticketFieldDefinitions[0].id]}
            />
        )
        expect(screen.getByText(/All the possible/))
    })

    it("should render static text if it's in view mode with an archived prefix if selected field is archived", () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {
                data: [
                    {
                        ...ticketFieldDefinitions[0],
                        deactivated_datetime: 'sometime',
                    },
                ],
            },
            isLoading: false,
        } as any)

        const {container} = render(
            <CustomFieldSelect
                onChange={jest.fn()}
                value={ticketFieldDefinitions[0].id}
                viewMode
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should filter out AI managed fields from the list of custom fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {
                data: [
                    ticketInputFieldDefinition,
                    aiManagedTicketInputFieldDefinition,
                ],
            },
            isLoading: false,
        } as any)

        render(<CustomFieldSelect onChange={jest.fn()} value={null} />)
        expect(
            screen.queryByText(ticketInputFieldDefinition.label)
        ).toBeInTheDocument()
        expect(
            screen.queryByText(aiManagedTicketInputFieldDefinition.label)
        ).not.toBeInTheDocument()
    })
})
