import React, { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { CallExpression as ESCallExpression, LogicalExpression } from 'estree'
import { fromJS } from 'immutable'

import { CustomField } from 'custom-fields/types'
import { view as viewFixture } from 'fixtures/views'
import useQAScoreFilters from 'pages/common/components/ViewTable/Filters/hooks/useQAScoreFilters'
import Left from 'pages/common/components/ViewTable/Filters/Left'
import Right from 'pages/common/components/ViewTable/Filters/Right'

import { CallExpression } from '../CallExpression'
import useCustomFieldsFilters from '../hooks/useCustomFieldsFilters'
import { QaScoreDimensions } from '../utils/qaScoreDimensions'

jest.mock('state/views/actions')

const updateOperatorMock = jest.fn()
const removeConditionMock = jest.fn()
const updateFieldFilterMock = jest.fn()

jest.mock('../hooks/useCustomFieldsFilters')
const useCustomFieldsFiltersMock = assumeMock(useCustomFieldsFilters)

jest.mock('pages/common/components/ViewTable/Filters/Left')
const LeftMock = assumeMock(Left)

jest.mock('pages/common/components/ViewTable/Filters/hooks/useQAScoreFilters')
const useQAScoreFiltersMock = assumeMock(useQAScoreFilters)

jest.mock(
    '../Right',
    () =>
        ({ updateFieldFilter, index }: ComponentProps<typeof Right>) => (
            <div
                onClick={() => {
                    updateFieldFilter(index, 'open')
                }}
            >
                Right
            </div>
        ),
)

const callExpressionNode = {
    type: 'CallExpression',
    callee: {
        type: 'Identifier',
        name: 'eq',
    },
    arguments: [
        {
            type: 'MemberExpression',
            computed: false,
            object: {
                type: 'Identifier',
                name: 'ticket',
            },
            property: {
                type: 'Identifier',
                name: 'status',
            },
        },
        {
            type: 'Literal',
            value: 'open',
            raw: "'open'",
        },
    ],
} as ESCallExpression

const minProps: ComponentProps<typeof CallExpression> = {
    node: callExpressionNode,
    view: fromJS(viewFixture),
    schemas: fromJS({
        definitions: {
            Ticket: {
                properties: {
                    status: {
                        type: 'string',
                        default: 'open',
                        description:
                            'Ticket status is used for managing the lifecycle of the ticket',
                        meta: {
                            enum: ['open', 'closed'],
                            rules: {
                                widget: 'select',
                            },
                            filters: {
                                widget: 'multi-select',
                            },
                            operators: {
                                eq: {
                                    label: 'is',
                                },
                                neq: {
                                    label: 'is not',
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    index: 0,
    agents: fromJS([]),
    teams: fromJS([]),
    updateOperator: updateOperatorMock,
    removeCondition: removeConditionMock,
    updateFieldFilter: updateFieldFilterMock,
    parentNode: {} as LogicalExpression,
    config: fromJS([
        {
            name: 'ticket_field',
            title: 'Ticket Field',
            path: 'custom_fields',
            filter: {
                showInModes: ['search'],
            },
            show: false,
        },
    ]),
    dispatch: jest.fn(),
}

describe('<CallExpression />', () => {
    beforeEach(() => {
        LeftMock.mockImplementation(() => <div>Left</div>)
        useCustomFieldsFiltersMock.mockReturnValue({
            customField: {} as CustomField,
            activeCustomFields: [],
            onCustomFieldChange: jest.fn(),
        })
        useQAScoreFiltersMock.mockReturnValue({
            qaScoreDimension: QaScoreDimensions.ACCURACY,
            onQAScoreDimensionFieldChange: jest.fn(),
        })
    })

    it('should update active view on remove field', () => {
        const { getByText } = render(<CallExpression {...minProps} />)
        fireEvent.click(getByText('clear'))
        expect(removeConditionMock).toHaveBeenLastCalledWith(0)
    })

    it('should update active view on update field', () => {
        const { getByText } = render(<CallExpression {...minProps} />)
        fireEvent.click(getByText('Right'))
        expect(updateFieldFilterMock).toHaveBeenLastCalledWith(0, 'open')
    })

    it('should update active view on update field operator', () => {
        render(<CallExpression {...minProps} />)
        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)
        const neqOption = screen.getByRole('option', { name: 'is not' })
        fireEvent.click(neqOption)

        expect(updateOperatorMock).toHaveBeenLastCalledWith(0, 'neq')
    })

    it('should render parent node expression operator', () => {
        const { getByText } = render(
            <CallExpression
                {...minProps}
                parentNode={{
                    operator: '&&',
                    type: 'LogicalExpression',
                    left: callExpressionNode,
                    right: callExpressionNode,
                }}
                index={1}
            />,
        )
        expect(getByText('And')).toBeInTheDocument()
    })

    it('should render system condition badge if respective field is absent', () => {
        const { getByText } = render(
            <CallExpression {...minProps} config={fromJS([])} />,
        )
        expect(getByText('System condition')).toBeInTheDocument()
    })
})
