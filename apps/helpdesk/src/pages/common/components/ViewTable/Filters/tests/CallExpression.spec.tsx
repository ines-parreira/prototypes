import type { ComponentProps } from 'react'
import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import type {
    CallExpression as ESCallExpression,
    LogicalExpression,
} from 'estree'
import { fromJS } from 'immutable'

import type { StoreMapping } from '@gorgias/helpdesk-queries'
import { useGetStoreMappingsByAccountId } from '@gorgias/helpdesk-queries'

import { OBJECT_PATHS } from 'custom-fields/constants'
import type { CustomField } from 'custom-fields/types'
import { view as viewFixture } from 'fixtures/views'
import useAppSelector from 'hooks/useAppSelector'
import useQAScoreFilters from 'pages/common/components/ViewTable/Filters/hooks/useQAScoreFilters'
import Left from 'pages/common/components/ViewTable/Filters/Left'
import Right from 'pages/common/components/ViewTable/Filters/Right'
import { getAST, getFirstExpressionOfAST } from 'utils'

import { CallExpression } from '../CallExpression'
import useCustomFieldsFilters from '../hooks/useCustomFieldsFilters'
import { QaScoreDimensions } from '../utils/qaScoreDimensions'

jest.mock('state/views/actions')
jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetStoreMappingsByAccountId: jest.fn(),
}))
const useGetStoreMappingsByAccountIdMock =
    useGetStoreMappingsByAccountId as jest.Mock
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

const updateOperatorMock = jest.fn()
const removeConditionMock = jest.fn()
const updateFieldFilterMock = jest.fn()

jest.mock('../hooks/useCustomFieldsFilters')
const useCustomFieldsFiltersMock = assumeMock(useCustomFieldsFilters)

jest.mock('pages/common/components/ViewTable/Filters/Left')
const LeftMock = assumeMock(Left)

jest.mock('pages/common/components/ViewTable/Filters/hooks/useQAScoreFilters')
const useQAScoreFiltersMock = assumeMock(useQAScoreFilters)

jest.mock('../Right', () =>
    jest.fn((props: ComponentProps<typeof Right>) => (
        <div
            onClick={() => {
                props.updateFieldFilter(props.index, 'open')
            }}
        >
            Right
        </div>
    )),
)

const RightMock = assumeMock(Right)

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

const customerCustomFieldCallExpression = getFirstExpressionOfAST(
    getAST("eq(ticket.customer.custom_fields['123'].value, 'vip')"),
).toJS() as ESCallExpression

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
        RightMock.mockClear()
        LeftMock.mockImplementation(() => <div>Left</div>)
        useCustomFieldsFiltersMock.mockReturnValue({
            customField: {
                definition: {
                    data_type: 'text',
                    input_settings: {
                        input_type: 'dropdown',
                    },
                },
            } as unknown as CustomField,
            activeCustomFields: [],
            onCustomFieldChange: jest.fn(),
        })
        useQAScoreFiltersMock.mockReturnValue({
            qaScoreDimension: QaScoreDimensions.ACCURACY,
            onQAScoreDimensionFieldChange: jest.fn(),
        })
        mockUseAppSelector.mockReturnValue({
            currentAccountId: 1,
        })
        useGetStoreMappingsByAccountIdMock.mockReturnValue({
            data: {
                data: [],
            },
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

    describe('store mappings integration', () => {
        const mockStoreMappings: StoreMapping[] = [
            {
                store_id: 1,
                integration_id: 123,
                created_datetime: '2021-01-01',
                updated_datetime: '2021-01-01',
            },
            {
                store_id: 2,
                integration_id: 456,
                created_datetime: '2021-01-01',
                updated_datetime: '2021-01-01',
            },
        ]

        it('should pass store mappings to Right component', () => {
            useGetStoreMappingsByAccountIdMock.mockReturnValue({
                data: {
                    data: { data: mockStoreMappings },
                },
            })
            render(<CallExpression {...minProps} />)

            expect(RightMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    storeMappings: mockStoreMappings,
                }),
                expect.anything(),
            )
        })

        it('should handle undefined store mappings data', () => {
            const {
                useGetStoreMappingsByAccountId,
            } = require('@gorgias/helpdesk-queries')
            useGetStoreMappingsByAccountId.mockReturnValue({
                data: undefined,
            })

            render(<CallExpression {...minProps} />)

            expect(RightMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    storeMappings: [],
                }),
                expect.anything(),
            )
        })
    })

    it('should resolve customer custom field config when path targets customer custom fields', () => {
        const configWithCustomFields = fromJS({
            singular: 'ticket',
            fields: [
                {
                    name: 'customer_field',
                    title: 'Customer field',
                    path: OBJECT_PATHS.CUSTOMER,
                },
                {
                    name: 'ticket_field',
                    title: 'Ticket field',
                    path: OBJECT_PATHS.TICKET,
                },
            ],
        })

        render(
            <CallExpression
                {...minProps}
                node={customerCustomFieldCallExpression}
                config={configWithCustomFields}
            />,
        )

        const rightProps = RightMock.mock.calls[0][0]
        const { field } = rightProps
        expect(field).toBeDefined()
        expect(field!.get('path')).toBe(OBJECT_PATHS.CUSTOMER)
        expect(field!.get('title')).toBe('Customer field')
    })
})
