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
import { useTicketFieldsStore } from '../store/useTicketFieldsStore'

vi.mock('../hooks/useTicketFields')

const mockuseTicketFields = vi.mocked(useTicketFields)

describe('InfobarTicketFields', () => {
    beforeEach(() => {
        useTicketFieldsStore.getState().resetFields()
        vi.clearAllMocks()
    })

    it('should display loading skeleton while fetching data', () => {
        mockuseTicketFields.mockReturnValue({
            ticketFields: [],
            isLoading: true,
        })

        const fields = useTicketFieldsStore.getState().fields
        const onFieldChange = vi.fn()
        const onFieldBlur = vi.fn()

        render(
            <InfobarTicketFields
                fields={fields}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
            />,
        )

        const skeleton = screen.getByLabelText('Loading')
        expect(skeleton).toBeInTheDocument()
    })

    it('should not render when no fields are available', () => {
        mockuseTicketFields.mockReturnValue({
            ticketFields: [],
            isLoading: false,
        })

        const fields = useTicketFieldsStore.getState().fields
        const onFieldChange = vi.fn()
        const onFieldBlur = vi.fn()

        const { container } = render(
            <InfobarTicketFields
                fields={fields}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
            />,
        )

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
        })

        const fields = useTicketFieldsStore.getState().fields
        const onFieldChange = vi.fn()
        const onFieldBlur = vi.fn()

        render(
            <InfobarTicketFields
                fields={fields}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
            />,
        )

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
        })

        const fields = useTicketFieldsStore.getState().fields
        const onFieldChange = vi.fn()
        const onFieldBlur = vi.fn()

        const { container } = render(
            <InfobarTicketFields
                fields={fields}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
            />,
        )

        const overflowList = container.querySelector(
            '[data-name="overflow-list"]',
        )
        expect(overflowList).toBeInTheDocument()
        expect(screen.getByText('Show more')).toBeInTheDocument()
    })

    it('should render fields with error state', () => {
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
                isRequired: true,
            },
            {
                fieldDefinition: mockCustomField({
                    id: 2,
                    label: 'Field 2',
                    object_type: ObjectType.Ticket,
                    definition: mockTextDataTypeDefinition({
                        input_settings: mockTextInputSettings({
                            input_type: InputSettingsTextInputType.Input,
                        }),
                    }),
                }),
                isRequired: true,
            },
        ]

        mockuseTicketFields.mockReturnValue({
            ticketFields: mockFields,
            isLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldError(2, true)

        const fields = useTicketFieldsStore.getState().fields
        const onFieldChange = vi.fn()
        const onFieldBlur = vi.fn()

        render(
            <InfobarTicketFields
                fields={fields}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
            />,
        )

        expect(screen.getByText('Field 1')).toBeInTheDocument()
        expect(screen.getByText('Field 2')).toBeInTheDocument()
    })
})
