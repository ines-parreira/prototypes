import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    JsonLogicOperator,
    ReportIssueVariable,
} from 'models/selfServiceConfiguration/types'
import type { JsonLogicRuleOverVariable } from 'models/selfServiceConfiguration/types'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'

import { ScenarioConditionRule } from '../conditionBuilder/ScenarioConditionRule'

jest.mock(
    'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField',
    () => ({
        __esModule: true,
        MultiSelectOptionsField: ({
            plural,
            singular,
            selectedOptions,
            onChange,
        }: {
            plural: string
            singular: string
            options: Option[]
            selectedOptions: Option[]
            onChange: (options: Option[]) => void
        }) => {
            return (
                <div data-mock="MultiSelectOptionsField">
                    <span>
                        {selectedOptions.length}{' '}
                        {selectedOptions.length === 1 ? singular : plural}{' '}
                        selected
                    </span>
                    <button
                        onClick={() =>
                            onChange([{ label: 'Open', value: 'open' }])
                        }
                    >
                        Select statuses
                    </button>
                </div>
            )
        },
    }),
)

jest.mock('assets/img/integrations/shopify.png', () => 'shopify.png')

const makeIsOneOfValue = (
    variable: ReportIssueVariable,
    statuses: string[] = [],
): JsonLogicRuleOverVariable => ({
    [JsonLogicOperator.IS_ONE_OF]: [{ var: variable }, statuses],
})

const makeEqualsValue = (
    variable: ReportIssueVariable,
): JsonLogicRuleOverVariable => ({
    [JsonLogicOperator.EQUALS]: [{ var: variable }, null],
})

describe('ScenarioConditionRule', () => {
    it('should render the variable label', () => {
        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByText('order status')).toBeInTheDocument()
    })

    it('should render conjunction text when provided', () => {
        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                conjunction="AND"
            />,
        )

        expect(screen.getByText('AND')).toBeInTheDocument()
    })

    it('should not render conjunction when not provided', () => {
        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.queryByText('AND')).not.toBeInTheDocument()
        expect(screen.queryByText('OR')).not.toBeInTheDocument()
    })

    it('should call onDelete when Remove condition button is clicked', async () => {
        const user = userEvent.setup()
        const onDelete = jest.fn()

        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={jest.fn()}
                onDelete={onDelete}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'Remove condition' }),
        )

        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('should show "is one of" text for financial status with a single operator option', () => {
        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.FINANCIAL_STATUS)}
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByText('is one of')).toBeInTheDocument()
    })

    it('should render SelectField for variables with multiple operator options', async () => {
        const user = userEvent.setup()

        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        await user.click(
            screen.getByRole('textbox', {
                name: `Operator for ${ReportIssueVariable.ORDER_STATUS}`,
            }),
        )

        expect(
            await screen.findByRole('option', { name: 'is one of' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'is empty' }),
        ).toBeInTheDocument()
    })

    it('should call onChange with EQUALS operator when operator changes to "is empty"', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={onChange}
                onDelete={jest.fn()}
            />,
        )

        await user.click(
            screen.getByRole('textbox', {
                name: `Operator for ${ReportIssueVariable.ORDER_STATUS}`,
            }),
        )
        await user.click(
            await screen.findByRole('option', { name: 'is empty' }),
        )

        expect(onChange).toHaveBeenCalledWith({
            [JsonLogicOperator.EQUALS]: [
                { var: ReportIssueVariable.ORDER_STATUS },
                null,
            ],
        })
    })

    it('should call onChange with IS_ONE_OF operator when operator changes to "is one of"', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <ScenarioConditionRule
                value={makeEqualsValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={onChange}
                onDelete={jest.fn()}
            />,
        )

        await user.click(
            screen.getByRole('textbox', {
                name: `Operator for ${ReportIssueVariable.ORDER_STATUS}`,
            }),
        )
        await user.click(
            await screen.findByRole('option', { name: 'is one of' }),
        )

        expect(onChange).toHaveBeenCalledWith({
            [JsonLogicOperator.IS_ONE_OF]: [
                { var: ReportIssueVariable.ORDER_STATUS },
                [],
            ],
        })
    })

    it('should render MultiSelectOptionsField when operator is IS_ONE_OF', () => {
        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByText('0 statuses selected')).toBeInTheDocument()
    })

    it('should not render MultiSelectOptionsField when operator is EQUALS', () => {
        render(
            <ScenarioConditionRule
                value={makeEqualsValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.queryByText(/statuses selected/)).not.toBeInTheDocument()
        expect(screen.queryByText(/status selected/)).not.toBeInTheDocument()
    })

    it('should call onChange with updated statuses when MultiSelectOptionsField changes', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={onChange}
                onDelete={jest.fn()}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'Select statuses' }),
        )

        expect(onChange).toHaveBeenCalledWith({
            [JsonLogicOperator.IS_ONE_OF]: [
                { var: ReportIssueVariable.ORDER_STATUS },
                ['open'],
            ],
        })
    })

    it('should not call onChange when the same operator is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS)}
                onChange={onChange}
                onDelete={jest.fn()}
            />,
        )

        await user.click(
            screen.getByRole('textbox', {
                name: `Operator for ${ReportIssueVariable.ORDER_STATUS}`,
            }),
        )
        await user.click(
            await screen.findByRole('option', { name: 'is one of' }),
        )

        expect(onChange).not.toHaveBeenCalled()
    })

    it('should render selected statuses count', () => {
        render(
            <ScenarioConditionRule
                value={makeIsOneOfValue(ReportIssueVariable.ORDER_STATUS, [
                    'open',
                ])}
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByText('1 status selected')).toBeInTheDocument()
    })
})
