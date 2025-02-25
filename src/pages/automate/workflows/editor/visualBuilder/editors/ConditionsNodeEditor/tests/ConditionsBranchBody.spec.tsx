import React from 'react'

import { render, screen } from '@testing-library/react'

import { ConditionsBranchBody } from '../ConditionsBranchBody'

describe('<ConditionsBranchBody />', () => {
    it('should display error message', () => {
        render(
            <ConditionsBranchBody
                maxConditionsTooltipMessage=""
                variableDropdownProps={{}}
                variablePickerTooltipMessage={null}
                hasMultipleChildren={true}
                canDeleteBranch={false}
                branchId={''}
                availableVariables={[]}
                showNoneOption={true}
                type={null}
                conditions={[]}
                onDeleteBranch={() => {}}
                onConditionDelete={jest.fn()}
                onVariableSelect={jest.fn()}
                onConditionTypeChange={jest.fn()}
                onConditionChange={jest.fn()}
                errors="Error message"
            />,
        )

        expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('should pass an icon to Conditions component', () => {
        render(
            <ConditionsBranchBody
                maxConditionsTooltipMessage=""
                variableDropdownProps={{}}
                variablePickerTooltipMessage={null}
                hasMultipleChildren={true}
                canDeleteBranch={false}
                branchId={''}
                availableVariables={[
                    {
                        name: 'ShipMonk order',
                        nodeType: 'order_shipmonk',
                        icon: 'icon',
                        variables: [
                            {
                                name: 'Order number',
                                value: 'objects.order_shipmonk.order_number',
                                nodeType: 'order_shipmonk',
                                type: 'string',
                                icon: 'icon',
                            },
                        ],
                    },
                ]}
                showNoneOption={true}
                type={'and'}
                conditions={[
                    {
                        equals: [
                            {
                                var: 'objects.order_shipmonk.order_number',
                            },
                            '1',
                        ],
                    },
                ]}
                onDeleteBranch={() => {}}
                onConditionDelete={jest.fn()}
                onVariableSelect={jest.fn()}
                onConditionTypeChange={jest.fn()}
                onConditionChange={jest.fn()}
            />,
        )

        expect(screen.getByText('icon')).toBeInTheDocument()
    })
})
