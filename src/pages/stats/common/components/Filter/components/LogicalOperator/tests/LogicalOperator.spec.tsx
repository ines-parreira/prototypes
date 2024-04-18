import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LogicalOperator from 'pages/stats/common/components/Filter/components/LogicalOperator/LogicalOperator'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'

describe('LogicalOperator', () => {
    const logicalOperators = [
        LogicalOperatorEnum.ALL_OF,
        LogicalOperatorEnum.ONE_OF,
        LogicalOperatorEnum.NOT_ONE_OF,
    ]
    const selectedLogicalOperator = LogicalOperatorEnum.ONE_OF
    const onChange = jest.fn()

    it('renders the component correctly', () => {
        const {container} = render(
            <LogicalOperator
                logicalOperators={logicalOperators}
                selectedLogicalOperator={selectedLogicalOperator}
                onChange={onChange}
            />
        )

        expect(container.firstChild).toBeInTheDocument()
    })

    it('calls the onChange function when a logical operator is selected', () => {
        const {getByLabelText} = render(
            <LogicalOperator
                logicalOperators={logicalOperators}
                selectedLogicalOperator={selectedLogicalOperator}
                onChange={onChange}
            />
        )

        const radioInput = getByLabelText(
            LogicalOperatorLabel[LogicalOperatorEnum.ALL_OF]
        )
        userEvent.click(radioInput)

        expect(onChange).toHaveBeenCalledWith(LogicalOperatorEnum.ALL_OF)
    })
})
