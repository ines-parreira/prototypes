import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    JsonLogicOperator,
    ReportIssueVariable,
} from 'models/selfServiceConfiguration/types'

import { ScenarioConditionBuilder } from '../conditionBuilder/ScenarioConditionBuilder'
import { ScenarioFormContext } from '../ScenarioFormContext'

jest.mock('pages/common/components/dropdown/Dropdown', () => ({
    __esModule: true,
    default: ({
        isOpen,
        children,
    }: {
        isOpen: boolean
        children: React.ReactNode
    }) => (isOpen ? <div>{children}</div> : null),
}))

jest.mock('pages/common/components/dropdown/DropdownHeader', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownBody', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownItem', () => ({
    __esModule: true,
    default: ({
        option,
        onClick,
    }: {
        option: { label: string; value: string }
        onClick: (value: string) => void
    }) => <button onClick={() => onClick(option.value)}>{option.label}</button>,
}))

jest.mock('../conditionBuilder/ScenarioConditionRule', () => ({
    ScenarioConditionRule: ({
        value,
        conjunction,
        onDelete,
    }: {
        value: any
        conjunction?: string
        onDelete: () => void
    }) => {
        const variable = Object.values(value)[0] as any
        return (
            <div>
                {conjunction && <span>{conjunction}</span>}
                <span>{variable?.[0]?.var}</span>
                <button onClick={onDelete}>Remove condition</button>
            </div>
        )
    },
}))

jest.mock('../conditionBuilder/ScenarioConditionOrBlock', () => ({
    ScenarioConditionOrBlock: ({
        value,
        onChange,
    }: {
        value: any
        onChange: (v: any) => void
    }) => (
        <div>
            <span>OrBlock({value.or.length})</span>
            <button onClick={() => onChange({ or: [] })}>Clear or block</button>
        </div>
    ),
}))

const noopContext = { setError: jest.fn() }

const renderBuilder = (value: any, onChange = jest.fn()) =>
    render(
        <ScenarioFormContext.Provider value={noopContext}>
            <ScenarioConditionBuilder value={value} onChange={onChange} />
        </ScenarioFormContext.Provider>,
    )

describe('ScenarioConditionBuilder', () => {
    it('should render the Add Condition button', () => {
        renderBuilder({ and: [] })

        expect(
            screen.getByRole('button', { name: 'Add Condition' }),
        ).toBeInTheDocument()
    })

    it('should open the variable dropdown when clicking Add Condition', async () => {
        const user = userEvent.setup()
        renderBuilder({ and: [] })

        await user.click(screen.getByRole('button', { name: 'Add Condition' }))

        expect(screen.getByText('Order status')).toBeInTheDocument()
        expect(screen.getByText('Fulfillment status')).toBeInTheDocument()
        expect(screen.getByText('Shipment status')).toBeInTheDocument()
        expect(screen.getByText('Financial status')).toBeInTheDocument()
    })

    it('should call onChange with the new condition when selecting a variable', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderBuilder({ and: [] }, onChange)

        await user.click(screen.getByRole('button', { name: 'Add Condition' }))
        await user.click(screen.getByRole('button', { name: 'Order status' }))

        expect(onChange).toHaveBeenCalledWith({
            and: [
                {
                    or: [
                        {
                            [JsonLogicOperator.IS_ONE_OF]: [
                                { var: ReportIssueVariable.ORDER_STATUS },
                                [],
                            ],
                        },
                    ],
                },
            ],
        })
    })

    it('should render the OrBlock when conditions exist', () => {
        renderBuilder({
            and: [
                {
                    or: [
                        {
                            [JsonLogicOperator.IS_ONE_OF]: [
                                { var: ReportIssueVariable.ORDER_STATUS },
                                [],
                            ],
                        },
                    ],
                },
            ],
        })

        expect(screen.getByText('OrBlock(1)')).toBeInTheDocument()
    })

    it('should hide the financial status option once it is already added', async () => {
        const user = userEvent.setup()
        renderBuilder({
            and: [
                {
                    [JsonLogicOperator.IS_ONE_OF]: [
                        { var: ReportIssueVariable.FINANCIAL_STATUS },
                        [],
                    ],
                },
            ],
        })

        await user.click(screen.getByRole('button', { name: 'Add Condition' }))

        expect(screen.queryByText('Financial status')).not.toBeInTheDocument()
    })

    it('should add financial status as a standalone rule', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderBuilder({ and: [] }, onChange)

        await user.click(screen.getByRole('button', { name: 'Add Condition' }))
        await user.click(
            screen.getByRole('button', { name: 'Financial status' }),
        )

        expect(onChange).toHaveBeenCalledWith({
            and: [
                {
                    [JsonLogicOperator.IS_ONE_OF]: [
                        { var: ReportIssueVariable.FINANCIAL_STATUS },
                        [],
                    ],
                },
            ],
        })
    })

    it('should add a condition to existing or block', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderBuilder(
            {
                and: [
                    {
                        or: [
                            {
                                [JsonLogicOperator.IS_ONE_OF]: [
                                    { var: ReportIssueVariable.ORDER_STATUS },
                                    [],
                                ],
                            },
                        ],
                    },
                ],
            },
            onChange,
        )

        await user.click(screen.getByRole('button', { name: 'Add Condition' }))
        await user.click(
            screen.getByRole('button', { name: 'Fulfillment status' }),
        )

        expect(onChange).toHaveBeenCalledWith({
            and: [
                {
                    or: [
                        {
                            [JsonLogicOperator.IS_ONE_OF]: [
                                { var: ReportIssueVariable.ORDER_STATUS },
                                [],
                            ],
                        },
                        {
                            [JsonLogicOperator.IS_ONE_OF]: [
                                { var: ReportIssueVariable.FULFILLMENT_STATUS },
                                [],
                            ],
                        },
                    ],
                },
            ],
        })
    })

    it('should render financial status rule with AND conjunction when or block exists', () => {
        renderBuilder({
            and: [
                {
                    or: [
                        {
                            [JsonLogicOperator.IS_ONE_OF]: [
                                { var: ReportIssueVariable.ORDER_STATUS },
                                [],
                            ],
                        },
                    ],
                },
                {
                    [JsonLogicOperator.IS_ONE_OF]: [
                        { var: ReportIssueVariable.FINANCIAL_STATUS },
                        [],
                    ],
                },
            ],
        })

        expect(screen.getByText('AND')).toBeInTheDocument()
    })

    it('should remove the or block when it becomes empty via Clear or block', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderBuilder(
            {
                and: [
                    {
                        or: [
                            {
                                [JsonLogicOperator.IS_ONE_OF]: [
                                    { var: ReportIssueVariable.ORDER_STATUS },
                                    [],
                                ],
                            },
                        ],
                    },
                ],
            },
            onChange,
        )

        await user.click(screen.getByRole('button', { name: 'Clear or block' }))

        expect(onChange).toHaveBeenCalledWith({ and: [] })
    })

    it('should remove financial status rule when its delete is called', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderBuilder(
            {
                and: [
                    {
                        [JsonLogicOperator.IS_ONE_OF]: [
                            { var: ReportIssueVariable.FINANCIAL_STATUS },
                            [],
                        ],
                    },
                ],
            },
            onChange,
        )

        await user.click(
            screen.getByRole('button', { name: 'Remove condition' }),
        )

        expect(onChange).toHaveBeenCalledWith({ and: [] })
    })

    it('should hide variable option when max conditions per variable is reached', async () => {
        const user = userEvent.setup()
        renderBuilder({
            and: [
                {
                    or: [
                        {
                            [JsonLogicOperator.IS_ONE_OF]: [
                                { var: ReportIssueVariable.ORDER_STATUS },
                                [],
                            ],
                        },
                        {
                            [JsonLogicOperator.IS_ONE_OF]: [
                                { var: ReportIssueVariable.ORDER_STATUS },
                                ['open'],
                            ],
                        },
                    ],
                },
            ],
        })

        await user.click(screen.getByRole('button', { name: 'Add Condition' }))

        expect(screen.queryByText('Order status')).not.toBeInTheDocument()
        expect(screen.getByText('Fulfillment status')).toBeInTheDocument()
    })

    it('should render with null conditions', () => {
        renderBuilder(null)

        expect(
            screen.getByRole('button', { name: 'Add Condition' }),
        ).toBeInTheDocument()
    })
})
