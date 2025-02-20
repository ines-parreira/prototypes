import {ExpressionOperator} from '@gorgias/api-queries'
import {SelectField} from '@gorgias/merchant-ui-kit'
import {render} from '@testing-library/react'
import React from 'react'

import {ticketDropdownFieldDefinition} from 'fixtures/customField'

import {
    EXPRESSION_OPERATORS_BY_UI_DATA_TYPE,
    EXPRESSION_OPERATORS_LABELS,
} from 'pages/settings/conditionalFields/constants'
import {assumeMock, getLastMockCall} from 'utils/testing'

import {OperatorField} from '../OperatorField'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            SelectField: jest.fn(() => <div data-testid="Mock" />),
        }) as Record<string, unknown>
)

const SelectFieldMock = assumeMock(SelectField)

describe('OperatorField', () => {
    const defaultProps = {
        pickedDefinition: ticketDropdownFieldDefinition,
        value: ExpressionOperator.Is,
        onChange: jest.fn(),
    }

    it('should render a SelectField with correct props', () => {
        render(<OperatorField {...defaultProps} />)

        expect(SelectFieldMock).toHaveBeenCalledWith(
            {
                options: EXPRESSION_OPERATORS_BY_UI_DATA_TYPE['dropdown_text'],
                onChange: defaultProps.onChange,
                isDisabled: false,
                selectedOption: defaultProps.value,
                optionMapper: expect.any(Function),
            },
            {}
        )
    })

    it('should handle defaults correctly', () => {
        render(
            <OperatorField
                {...defaultProps}
                value={undefined}
                pickedDefinition={undefined}
            />
        )

        expect(SelectFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                options: [],
                selectedOption: null,
                isDisabled: true,
            }),
            {}
        )
    })

    it('should provide a correct optionMapper', () => {
        render(<OperatorField {...defaultProps} />)

        const {optionMapper} = getLastMockCall(SelectFieldMock)[0]

        expect(optionMapper?.(ExpressionOperator.Is)).toEqual({
            value: EXPRESSION_OPERATORS_LABELS[ExpressionOperator.Is],
        })
    })
})
