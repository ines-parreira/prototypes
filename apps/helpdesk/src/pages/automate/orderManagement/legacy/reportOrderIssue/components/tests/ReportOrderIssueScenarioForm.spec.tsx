import React from 'react'

import { render, screen } from '@testing-library/react'

import ReportOrderIssueScenarioForm from '../ReportOrderIssueScenarioForm'

describe('<ReportOrderIssueScenarioForm />', () => {
    it('should render component', () => {
        render(
            <ReportOrderIssueScenarioForm
                onChange={jest.fn()}
                expandedReason="reason"
                isFallback={false}
                onExpandedReasonChange={jest.fn()}
                onHoveredReasonChange={jest.fn()}
                onPreviewChange={jest.fn()}
                value={{
                    title: 'title',
                    newReasons: [],
                    conditions: { and: [] },
                    description: 'description',
                }}
            />,
        )

        expect(screen.getByText('Add Condition')).toBeInTheDocument()
    })
})
