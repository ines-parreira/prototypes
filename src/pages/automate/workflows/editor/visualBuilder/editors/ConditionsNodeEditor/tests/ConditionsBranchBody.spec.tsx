import {render, screen} from '@testing-library/react'
import React from 'react'

import {ConditionsBranchBody} from '../ConditionsBranchBody'

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
                shouldShowErrors={true}
                type={null}
                conditions={[]}
                onDeleteBranch={() => {}}
                onConditionDelete={jest.fn()}
                onVariableSelect={jest.fn()}
                onConditionTypeChange={jest.fn()}
                onConditionChange={jest.fn()}
                emptyBranchErrorMessage="Error message"
            />
        )

        expect(screen.getByText('Error message')).toBeInTheDocument()
    })
})
