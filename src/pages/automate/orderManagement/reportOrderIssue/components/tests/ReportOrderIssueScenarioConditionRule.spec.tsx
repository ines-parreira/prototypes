import {render, screen} from '@testing-library/react'
import React from 'react'

import {ReportIssueVariable} from 'models/selfServiceConfiguration/types'

import ReportOrderIssueScenarioConditionRule from '../ReportOrderIssueScenarioConditionRule'

describe('<ReportOrderIssueScenarioConditionRule />', () => {
    it('should render component', () => {
        render(
            <ReportOrderIssueScenarioConditionRule
                onChange={jest.fn()}
                onDelete={jest.fn()}
                value={{
                    '===': [{var: ReportIssueVariable.FINANCIAL_STATUS}, null],
                }}
                conjunction="OR"
            />
        )

        expect(screen.getByText('financial status')).toBeInTheDocument()
    })
})
