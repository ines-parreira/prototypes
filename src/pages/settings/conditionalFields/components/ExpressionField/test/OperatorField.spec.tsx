import React from 'react'

import { render } from '@testing-library/react'

import { ExpressionOperator } from '@gorgias/api-queries'
import { SelectField } from '@gorgias/merchant-ui-kit'

import { useFormContext } from 'core/forms'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import {
    EXPRESSION_OPERATORS_BY_UI_DATA_TYPE,
    EXPRESSION_OPERATORS_LABELS,
} from 'pages/settings/conditionalFields/constants'
import { assumeMock, getLastMockCall } from 'utils/testing'

import { OperatorField } from '../OperatorField'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            SelectField: jest.fn(() => <div data-testid="Mock" />),
        }) as Record<string, unknown>,
)
jest.mock('core/forms', () => ({
    useFormContext: jest.fn(),
}))

const SelectFieldMock = assumeMock(SelectField)
const useFormContextMock = assumeMock(useFormContext)

describe('OperatorField', () => {
    const defaultProps = {
        pickedDefinition: ticketDropdownFieldDefinition,
        value: ExpressionOperator.Is,
        onChange: jest.fn(),
        index: 1,
    }
    const setValueMock = jest.fn()
    beforeEach(() => {
        useFormContextMock.mockReturnValue({
            setValue: setValueMock,
        } as unknown as ReturnType<typeof useFormContext>)
    })

    it('should render a SelectField with correct props', () => {
        render(<OperatorField {...defaultProps} />)

        expect(SelectFieldMock).toHaveBeenCalledWith(
            {
                options: EXPRESSION_OPERATORS_BY_UI_DATA_TYPE['dropdown_text'],
                isDisabled: false,
                selectedOption: defaultProps.value,
                optionMapper: expect.any(Function),
                onChange: expect.any(Function),
            },
            {},
        )
    })

    it('should handle defaults correctly', () => {
        render(
            <OperatorField
                {...defaultProps}
                value={undefined}
                pickedDefinition={undefined}
            />,
        )

        expect(SelectFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                options: [],
                selectedOption: null,
                isDisabled: true,
            }),
            {},
        )
    })

    it('should provide a correct optionMapper', () => {
        render(<OperatorField {...defaultProps} />)

        const { optionMapper } = getLastMockCall(SelectFieldMock)[0]

        expect(optionMapper?.(ExpressionOperator.Is)).toEqual({
            value: EXPRESSION_OPERATORS_LABELS[ExpressionOperator.Is],
        })
    })

    it('should call onChange and setValue with null when operator is IsNotEmpty', () => {
        render(<OperatorField {...defaultProps} />)

        const { onChange } = getLastMockCall(SelectFieldMock)[0]

        onChange(ExpressionOperator.IsOneOf)
        expect(defaultProps.onChange).toHaveBeenCalledWith(
            ExpressionOperator.IsOneOf,
        )
        expect(setValueMock).not.toHaveBeenCalled()

        onChange(ExpressionOperator.IsNotEmpty)
        expect(defaultProps.onChange).toHaveBeenCalledWith(
            ExpressionOperator.IsNotEmpty,
        )
        expect(setValueMock).toHaveBeenCalledWith(
            `expression.${defaultProps.index}.values`,
            null,
        )
    })
})
