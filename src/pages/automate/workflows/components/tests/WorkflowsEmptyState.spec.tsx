import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import WorkflowsEmptyState from '../WorkflowsEmptyState'

jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
describe('WorkflowsEmptyState', () => {
    const mockGoToNewWorkflowPage = jest.fn()
    const mockGoToWorkflowTemplatesPage = jest.fn()
    const mockGoToNewWorkflowFromTemplatePage = jest.fn()

    test('renders the component with all elements when SunsetQuickResponses flag is false', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: false,
        })

        render(
            <WorkflowsEmptyState
                goToNewWorkflowPage={mockGoToNewWorkflowPage}
                goToWorkflowTemplatesPage={mockGoToWorkflowTemplatesPage}
                goToNewWorkflowFromTemplatePage={
                    mockGoToNewWorkflowFromTemplatePage
                }
            />
        )

        // Check that the banner is rendered
        expect(
            screen.getByText(
                'Choose a template and customize it to fit your needs'
            )
        ).toBeInTheDocument()

        // Check that both buttons are rendered
        expect(screen.getByText('Create Custom Flow')).toBeInTheDocument()
        expect(screen.getByText('Create From Template')).toBeInTheDocument()

        // Check that "See All Templates" button is rendered
        expect(screen.getByText('See All Templates')).toBeInTheDocument()
    })

    test('hides the create buttons when SunsetQuickResponses flag is true', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: true,
        })

        render(
            <WorkflowsEmptyState
                goToNewWorkflowPage={mockGoToNewWorkflowPage}
                goToWorkflowTemplatesPage={mockGoToWorkflowTemplatesPage}
                goToNewWorkflowFromTemplatePage={
                    mockGoToNewWorkflowFromTemplatePage
                }
            />
        )

        // Check that the create buttons are not rendered
        expect(screen.queryByText('Create Custom Flow')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Create From Template')
        ).not.toBeInTheDocument()
    })

    test('calls the correct function when buttons are clicked', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.SunsetQuickResponses]: false,
        })

        render(
            <WorkflowsEmptyState
                goToNewWorkflowPage={mockGoToNewWorkflowPage}
                goToWorkflowTemplatesPage={mockGoToWorkflowTemplatesPage}
                goToNewWorkflowFromTemplatePage={
                    mockGoToNewWorkflowFromTemplatePage
                }
            />
        )

        // Click "Create Custom Flow"
        fireEvent.click(screen.getByText('Create Custom Flow'))
        expect(mockGoToNewWorkflowPage).toHaveBeenCalledTimes(1)

        // Click "Create From Template"
        fireEvent.click(screen.getByText('Create From Template'))
        expect(mockGoToWorkflowTemplatesPage).toHaveBeenCalledTimes(1)

        // Click "See All Templates"
        fireEvent.click(screen.getByText('See All Templates'))
        expect(mockGoToWorkflowTemplatesPage).toHaveBeenCalledTimes(2)
    })
})
