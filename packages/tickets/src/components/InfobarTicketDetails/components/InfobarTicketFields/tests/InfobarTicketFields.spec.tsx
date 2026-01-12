import { screen } from '@testing-library/react'

import {
    mockCustomField,
    mockNumberDataTypeDefinition,
    mockNumberInputSettings,
    mockTextDataTypeDefinition,
    mockTextInputSettings,
} from '@gorgias/helpdesk-mocks'
import {
    InputSettingsNumberInputType,
    InputSettingsTextInputType,
    ObjectType,
} from '@gorgias/helpdesk-types'

import { render } from '../../../../../tests/render.utils'
import { useTicketFields } from '../hooks/useTicketFields'
import { InfobarTicketFields } from '../InfobarTicketFields'

vi.mock('../hooks/useTicketFields')

const mockuseTicketFields = vi.mocked(useTicketFields)

describe('InfobarTicketFields', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should display loading skeleton while fetching data', () => {
        mockuseTicketFields.mockReturnValue({
            ticketFields: [],
            isLoading: true,
            isInitializing: true,
            isLoadingDefinitions: false,
            conditionsLoading: false,
        })

        render(<InfobarTicketFields ticketId="123" />)

        const skeleton = screen.getByLabelText('Loading')
        expect(skeleton).toBeInTheDocument()
    })

    it('should not render when no fields are available', () => {
        mockuseTicketFields.mockReturnValue({
            ticketFields: [],
            isLoading: false,
            isInitializing: false,
            isLoadingDefinitions: false,
            conditionsLoading: false,
        })

        const { container } = render(<InfobarTicketFields ticketId="123" />)

        expect(container.firstChild).toBeNull()
    })

    it('should render fields when available', () => {
        const mockFields = [
            {
                fieldDefinition: mockCustomField({
                    id: 1,
                    label: 'Issue Type',
                    object_type: ObjectType.Ticket,
                    definition: mockTextDataTypeDefinition({
                        input_settings: mockTextInputSettings({
                            input_type: InputSettingsTextInputType.Input,
                        }),
                    }),
                }),
                isRequired: false,
            },
            {
                fieldDefinition: mockCustomField({
                    id: 2,
                    label: 'Priority',
                    object_type: ObjectType.Ticket,
                    definition: mockNumberDataTypeDefinition({
                        input_settings: mockNumberInputSettings({
                            input_type:
                                InputSettingsNumberInputType.InputNumber,
                        }),
                    }),
                }),
                isRequired: true,
            },
        ]

        mockuseTicketFields.mockReturnValue({
            ticketFields: mockFields,
            isLoading: false,
            isInitializing: false,
            isLoadingDefinitions: false,
            conditionsLoading: false,
        })

        render(<InfobarTicketFields ticketId="123" />)

        expect(screen.getByText('Issue Type')).toBeInTheDocument()
        expect(screen.getByText('Priority')).toBeInTheDocument()
    })

    it('should render overflow list with Show more button', () => {
        const mockFields = [
            {
                fieldDefinition: mockCustomField({
                    id: 1,
                    label: 'Field 1',
                    object_type: ObjectType.Ticket,
                    definition: mockTextDataTypeDefinition({
                        input_settings: mockTextInputSettings({
                            input_type: InputSettingsTextInputType.Input,
                        }),
                    }),
                }),
                isRequired: false,
            },
        ]

        mockuseTicketFields.mockReturnValue({
            ticketFields: mockFields,
            isLoading: false,
            isInitializing: false,
            isLoadingDefinitions: false,
            conditionsLoading: false,
        })

        const { container } = render(<InfobarTicketFields ticketId="123" />)

        const overflowList = container.querySelector(
            '[data-name="overflow-list"]',
        )
        expect(overflowList).toBeInTheDocument()
        expect(screen.getByText('Show more')).toBeInTheDocument()
    })
})
