import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import ReportOrderIssueScenarioConditions from '../ReportOrderIssueScenarioConditions'

describe('<ReportOrderIssueScenarioConditions />', () => {
    it('should render component', () => {
        render(
            <ReportOrderIssueScenarioConditions
                onChange={jest.fn()}
                value={{
                    and: [],
                }}
            />,
        )

        expect(screen.getByText('Add Condition')).toBeInTheDocument()
    })
})
