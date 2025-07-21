import React from 'react'

import { render, screen } from '@testing-library/react'

import { ReportIssueVariable } from 'models/selfServiceConfiguration/types'

import ReportOrderIssueScenarioItem from '../ReportOrderIssueScenarioConditionOrBlock'

describe('<ReportOrderIssueScenarioItem />', () => {
    it('should render component', () => {
        render(
            <ReportOrderIssueScenarioItem
                isElevated
                onChange={jest.fn()}
                value={{
                    or: [
                        {
                            '===': [
                                { var: ReportIssueVariable.FINANCIAL_STATUS },
                                null,
                            ],
                        },
                    ],
                }}
            />,
        )

        expect(screen.getByText('financial status')).toBeInTheDocument()
    })
})
