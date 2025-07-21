import React from 'react'

import { render, screen } from '@testing-library/react'

import WorkflowsEmptyState from '../WorkflowsEmptyState'

jest.mock('launchdarkly-react-client-sdk')

describe('WorkflowsEmptyState', () => {
    const mockGoToWorkflowTemplatesPage = jest.fn()
    const mockGoToNewWorkflowFromTemplatePage = jest.fn()

    test('hides the create buttons', () => {
        render(
            <WorkflowsEmptyState
                goToWorkflowTemplatesPage={mockGoToWorkflowTemplatesPage}
                goToNewWorkflowFromTemplatePage={
                    mockGoToNewWorkflowFromTemplatePage
                }
            />,
        )

        // Check that the create buttons are not rendered
        expect(screen.queryByText('Create Custom Flow')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Create From Template'),
        ).not.toBeInTheDocument()
    })
})
