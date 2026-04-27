import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    JsonLogicOperator,
    ReportIssueVariable,
} from 'models/selfServiceConfiguration/types'
import type {
    JsonLogicOrBlock,
    JsonLogicRuleOverVariable,
} from 'models/selfServiceConfiguration/types'

import { ScenarioConditionOrBlock } from '../conditionBuilder/ScenarioConditionOrBlock'

jest.mock('../conditionBuilder/ScenarioConditionRule', () => ({
    ScenarioConditionRule: ({
        value,
        conjunction,
        onChange,
        onDelete,
    }: {
        value: JsonLogicRuleOverVariable
        conjunction?: string
        onChange: (nextValue: JsonLogicRuleOverVariable) => void
        onDelete: () => void
    }) => {
        const operator = Object.keys(value)[0] as JsonLogicOperator
        const operand = (value as any)[operator] as [
            { var: ReportIssueVariable },
            unknown,
        ]
        return (
            <div>
                {conjunction && <span>{conjunction}</span>}
                <span>{operand[0].var}</span>
                <button
                    onClick={() =>
                        onChange({
                            [JsonLogicOperator.EQUALS]: [operand[0], null],
                        })
                    }
                >
                    Change rule {operand[0].var}
                </button>
                <button onClick={onDelete}>Delete rule {operand[0].var}</button>
            </div>
        )
    },
}))

const makeRule = (
    variable: ReportIssueVariable,
): JsonLogicRuleOverVariable => ({
    [JsonLogicOperator.IS_ONE_OF]: [{ var: variable }, []],
})

const renderComponent = (value: JsonLogicOrBlock, onChange = jest.fn()) => {
    return {
        onChange,
        ...render(
            <ScenarioConditionOrBlock value={value} onChange={onChange} />,
        ),
    }
}

describe('ScenarioConditionOrBlock', () => {
    it('should render a rule for each item in the or block', () => {
        renderComponent({
            or: [
                makeRule(ReportIssueVariable.ORDER_STATUS),
                makeRule(ReportIssueVariable.FULFILLMENT_STATUS),
                makeRule(ReportIssueVariable.SHIPMENT_STATUS),
            ],
        })

        expect(
            screen.getByText(ReportIssueVariable.ORDER_STATUS),
        ).toBeInTheDocument()
        expect(
            screen.getByText(ReportIssueVariable.FULFILLMENT_STATUS),
        ).toBeInTheDocument()
        expect(
            screen.getByText(ReportIssueVariable.SHIPMENT_STATUS),
        ).toBeInTheDocument()
    })

    it('should render no conjunction for the first rule and OR for subsequent rules', () => {
        renderComponent({
            or: [
                makeRule(ReportIssueVariable.ORDER_STATUS),
                makeRule(ReportIssueVariable.FULFILLMENT_STATUS),
                makeRule(ReportIssueVariable.SHIPMENT_STATUS),
            ],
        })

        const orLabels = screen.getAllByText('OR')
        expect(orLabels).toHaveLength(2)
    })

    it('should call onChange with updated rule when a rule changes', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent(
            {
                or: [
                    makeRule(ReportIssueVariable.ORDER_STATUS),
                    makeRule(ReportIssueVariable.FULFILLMENT_STATUS),
                ],
            },
            onChange,
        )

        await user.click(
            screen.getByRole('button', {
                name: `Change rule ${ReportIssueVariable.FULFILLMENT_STATUS}`,
            }),
        )

        expect(onChange).toHaveBeenCalledWith({
            or: [
                makeRule(ReportIssueVariable.ORDER_STATUS),
                {
                    [JsonLogicOperator.EQUALS]: [
                        { var: ReportIssueVariable.FULFILLMENT_STATUS },
                        null,
                    ],
                },
            ],
        })
    })

    it('should call onChange with the rule removed when a rule is deleted', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent(
            {
                or: [
                    makeRule(ReportIssueVariable.ORDER_STATUS),
                    makeRule(ReportIssueVariable.FULFILLMENT_STATUS),
                    makeRule(ReportIssueVariable.SHIPMENT_STATUS),
                ],
            },
            onChange,
        )

        await user.click(
            screen.getByRole('button', {
                name: `Delete rule ${ReportIssueVariable.FULFILLMENT_STATUS}`,
            }),
        )

        expect(onChange).toHaveBeenCalledWith({
            or: [
                makeRule(ReportIssueVariable.ORDER_STATUS),
                makeRule(ReportIssueVariable.SHIPMENT_STATUS),
            ],
        })
    })

    it('should handle a single-rule or block', () => {
        renderComponent({
            or: [makeRule(ReportIssueVariable.ORDER_STATUS)],
        })

        expect(
            screen.getByText(ReportIssueVariable.ORDER_STATUS),
        ).toBeInTheDocument()
        expect(screen.queryByText('OR')).not.toBeInTheDocument()
    })

    it('should handle an empty or block', () => {
        const { container } = renderComponent({ or: [] })

        expect(container.querySelectorAll('button')).toHaveLength(0)
        expect(screen.queryByText('OR')).not.toBeInTheDocument()
    })
})
