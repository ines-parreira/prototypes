import {SelectInput} from '@gorgias/merchant-ui-kit'
import {render} from '@testing-library/react'
import React from 'react'
import {useFormContext} from 'react-hook-form'

import {SUPPORTED_UI_DATA_TYPE_VALUES} from 'custom-fields/constants'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'

import {EXPRESSION_OPERATORS_BY_UI_DATA_TYPE} from 'pages/settings/conditionalFields/constants'
import {assumeMock, getLastMockCall} from 'utils/testing'

import {FieldField} from '../FieldField'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            SelectInput: jest.fn(() => <div data-testid="Mock" />),
        }) as Record<string, unknown>
)
jest.mock('react-hook-form', () => ({
    useFormContext: jest.fn(),
}))

const SelectInputMock = assumeMock(SelectInput)
const useFormContextMock = assumeMock(useFormContext)

describe('FieldField', () => {
    const setValueMock = jest.fn()
    beforeEach(() => {
        useFormContextMock.mockReturnValue({
            setValue: setValueMock,
        } as unknown as ReturnType<typeof useFormContext>)
    })

    const defaultProps = {
        customFieldDefinitions: [
            ticketNumberFieldDefinition,
            ticketDropdownFieldDefinition,
        ],
        value: ticketDropdownFieldDefinition.id,
        onChange: jest.fn(),
        index: 1,
    }

    it('should render a SelectInput with correct props', () => {
        render(<FieldField {...defaultProps} />)

        expect(SelectInputMock).toHaveBeenCalledWith(
            {
                options: defaultProps.customFieldDefinitions,
                selectedOption: ticketDropdownFieldDefinition,
                optionMapper: expect.any(Function),
                placeholder: 'Select ticket field',
                onChange: expect.any(Function),
            },
            {}
        )
    })

    it('should filter out text field definitions', () => {
        render(
            <FieldField
                {...defaultProps}
                value={undefined}
                customFieldDefinitions={[ticketInputFieldDefinition]}
            />
        )

        expect(SelectInputMock).toHaveBeenCalledWith(
            expect.objectContaining({
                options: [],
                selectedOption: null,
            }),
            {}
        )
    })

    it('should provide a correct optionMapper', () => {
        render(<FieldField {...defaultProps} />)

        const optionMapper = getLastMockCall(SelectInputMock)[0].optionMapper

        expect(optionMapper?.(ticketNumberFieldDefinition)).toEqual({
            value: ticketNumberFieldDefinition.label,
            subtext: SUPPORTED_UI_DATA_TYPE_VALUES['input_number_number'].name,
        })
    })

    it('should call onChange and setValue on change', () => {
        render(<FieldField {...defaultProps} />)

        const onChange = getLastMockCall(SelectInputMock)[0].onChange
        onChange(ticketNumberFieldDefinition)

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            ticketNumberFieldDefinition.id
        )
        expect(setValueMock).toHaveBeenCalledWith(
            `expression.${defaultProps.index}.operator`,
            EXPRESSION_OPERATORS_BY_UI_DATA_TYPE['input_number_number'][0]
        )
        expect(setValueMock).toHaveBeenCalledWith(
            `expression.${defaultProps.index}.values`,
            []
        )
    })
})
