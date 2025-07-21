import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'

import { WORKFLOW_TEMPLATES_LIST } from '../workflowTemplates'
import WorkflowTemplatesView from '../WorkflowTemplatesView'

jest.mock('launchdarkly-react-client-sdk')
jest.mock(
    'assets/img/icons/arrow-backward.svg',
    () => 'arrow-backward-icon-mock',
)

const defaultProps = {
    goToNewWorkflowPage: jest.fn(),
    goToNewWorkflowFromTemplatePage: jest.fn(),
    workflowsURL: '/workflows',
}

describe('WorkflowTemplatesView', () => {
    it('should renders correctly', () => {
        render(
            <Router>
                <WorkflowTemplatesView {...defaultProps} />
            </Router>,
        )

        expect(screen.getByText('Flow Templates')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Choose a template and customize it to fit your needs',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Create Custom Flow')).toBeInTheDocument()
        for (const wotemplate of WORKFLOW_TEMPLATES_LIST) {
            expect(screen.getByText(wotemplate.description)).toBeInTheDocument()
        }
        expect(screen.getByText('Custom Flow')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Create Custom Flow'))
        expect(defaultProps.goToNewWorkflowPage).toHaveBeenCalled()
    })

    it('renders the back link correctly', () => {
        render(
            <Router>
                <WorkflowTemplatesView {...defaultProps} />
            </Router>,
        )

        expect(screen.getByText('Back To Flows')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: /back/i })).toBeInTheDocument()
    })
})
