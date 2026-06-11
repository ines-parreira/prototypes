import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { Route, useLocation } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { WorkflowTemplatesView } from '../WorkflowTemplatesView'
import { WorkflowTemplatesViewContainer } from '../WorkflowTemplatesViewContainer'

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))
jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))
jest.mock('settings/automate/hooks/useAutomateBaseURL', () => ({
    useAutomateBaseURL: jest.fn(),
}))
jest.mock('../WorkflowTemplatesView', () => ({
    WorkflowTemplatesView: jest.fn(() => (
        <div data-testid="workflow-templates-view" />
    )),
}))

const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const useIsAutomateSettingsMock = assumeMock(useIsAutomateSettings)
const useAutomateBaseURLMock = assumeMock(useAutomateBaseURL)
const WorkflowTemplatesViewMock = assumeMock(WorkflowTemplatesView)
const templatesPath = '/app/automation/:shopType/:shopName/flows/templates'
const templatesRoute =
    '/app/automation/test-shop-type/test-shop-name/flows/templates'
const CurrentPath = () => {
    const location = useLocation()

    return (
        <output aria-label="Current path">
            {location.pathname}
            {location.search}
        </output>
    )
}

describe('WorkflowTemplatesViewContainer', () => {
    beforeEach(() => {
        useIsAutomateSettingsMock.mockReturnValue(false)
        useAutomateBaseURLMock.mockReturnValue('/app/settings')
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })
    const renderContainer = () =>
        render(
            <>
                <Route path={templatesPath}>
                    <WorkflowTemplatesViewContainer />
                </Route>
                <CurrentPath />
            </>,
            {
                initialEntries: [templatesRoute],
            },
        )

    it('should redirect when user does not have automate', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderContainer()

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            '/app/settings',
        )
    })

    it('should render WorkflowTemplatesView when user has automate', () => {
        renderContainer()

        expect(
            screen.getByTestId('workflow-templates-view'),
        ).toBeInTheDocument()

        expect(WorkflowTemplatesViewMock).toHaveBeenCalledWith(
            expect.objectContaining({
                workflowsURL:
                    '/app/automation/test-shop-type/test-shop-name/flows',
                goToNewWorkflowPage: expect.any(Function),
                goToNewWorkflowFromTemplatePage: expect.any(Function),
            }),
            expect.anything(),
        )
    })

    it('should use correct URL when in automate settings', () => {
        useIsAutomateSettingsMock.mockReturnValue(true)

        renderContainer()

        expect(WorkflowTemplatesViewMock).toHaveBeenCalledWith(
            expect.objectContaining({
                workflowsURL:
                    '/app/settings/flows/test-shop-type/test-shop-name',
            }),
            expect.anything(),
        )
    })

    it('should navigate to new workflow page when goToNewWorkflowPage is called', () => {
        renderContainer()

        const { goToNewWorkflowPage } =
            WorkflowTemplatesViewMock.mock.calls[0][0]

        act(() => {
            goToNewWorkflowPage()
        })

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            '/app/automation/test-shop-type/test-shop-name/flows/new?from=templates',
        )
    })

    it('should navigate to new workflow from template page when goToNewWorkflowFromTemplatePage is called', () => {
        renderContainer()

        const { goToNewWorkflowFromTemplatePage } =
            WorkflowTemplatesViewMock.mock.calls[0][0]

        act(() => {
            goToNewWorkflowFromTemplatePage('test-template')
        })

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            '/app/automation/test-shop-type/test-shop-name/flows/new?template=test-template&from=templates',
        )
    })
})
