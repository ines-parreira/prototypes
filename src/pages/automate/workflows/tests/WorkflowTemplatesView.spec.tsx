import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import {BrowserRouter as Router} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import WorkflowTemplatesView from '../WorkflowTemplatesView'
import {WORKFLOW_TEMPLATES_LIST} from '../workflowTemplates'

jest.mock('launchdarkly-react-client-sdk')
jest.mock(
    'assets/img/icons/arrow-backward.svg',
    () => 'arrow-backward-icon-mock'
)

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

const defaultProps = {
    goToNewWorkflowPage: jest.fn(),
    goToNewWorkflowFromTemplatePage: jest.fn(),
    workflowsUrl: '/workflows',
}

describe('WorkflowTemplatesView', () => {
    it('renders correctly when sunsetQuickResponses is true', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: true,
        })

        render(
            <Router>
                <WorkflowTemplatesView {...defaultProps} />
            </Router>
        )

        expect(screen.getByText('Flow Templates')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Choose a template and customize it to fit your needs'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Create Custom Flow')).toBeInTheDocument()
        for (const wotemplate of WORKFLOW_TEMPLATES_LIST) {
            expect(screen.getByText(wotemplate.description)).toBeInTheDocument()
        }
        expect(screen.getByText('Custom Flow')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Create Custom Flow'))
        expect(defaultProps.goToNewWorkflowPage).toHaveBeenCalled()
    })

    it('renders correctly when sunsetQuickResponses is false', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: false,
        })

        render(
            <Router>
                <WorkflowTemplatesView {...defaultProps} />
            </Router>
        )

        expect(screen.getByText('Flow templates')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Start with a Flow template that you can customize to fit your needs:'
            )
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
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: true,
        })

        render(
            <Router>
                <WorkflowTemplatesView {...defaultProps} />
            </Router>
        )

        expect(screen.getByText('Back To Flows')).toBeInTheDocument()
        expect(screen.getByRole('img', {name: /back/i})).toBeInTheDocument()
    })
})
