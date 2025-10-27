import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { renderWithRouter } from 'utils/testing'

import WorkflowTemplatesView from '../WorkflowTemplatesView'
import WorkflowTemplatesViewContainer from '../WorkflowTemplatesViewContainer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({
        shopType: 'test-shop-type',
        shopName: 'test-shop-name',
    }),
    useHistory: jest.fn(),
    Redirect: jest.fn(({ to }) => <div data-testid="redirect" data-to={to} />),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))
jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))
jest.mock('settings/automate/hooks/useAutomateBaseURL', () => ({
    useAutomateBaseURL: jest.fn(),
}))
jest.mock('../WorkflowTemplatesView', () =>
    jest.fn(() => <div data-testid="workflow-templates-view" />),
)

const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const useIsAutomateSettingsMock = assumeMock(useIsAutomateSettings)
const useAutomateBaseURLMock = assumeMock(useAutomateBaseURL)
const WorkflowTemplatesViewMock = assumeMock(WorkflowTemplatesView)
const historyPushMock = jest.fn()

describe('WorkflowTemplatesViewContainer', () => {
    beforeEach(() => {
        useIsAutomateSettingsMock.mockReturnValue(false)
        useAutomateBaseURLMock.mockReturnValue('/app/settings')
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        require('react-router-dom').useHistory.mockReturnValue({
            push: historyPushMock,
        })
    })

    it('should redirect when user does not have automate', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderWithRouter(<WorkflowTemplatesViewContainer />)

        const redirectElement = screen.getByTestId('redirect')
        expect(redirectElement).toBeInTheDocument()
        expect(redirectElement).toHaveAttribute('data-to', '/app/settings')
    })

    it('should render WorkflowTemplatesView when user has automate', () => {
        renderWithRouter(<WorkflowTemplatesViewContainer />)

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

        renderWithRouter(<WorkflowTemplatesViewContainer />)

        expect(WorkflowTemplatesViewMock).toHaveBeenCalledWith(
            expect.objectContaining({
                workflowsURL:
                    '/app/settings/flows/test-shop-type/test-shop-name',
            }),
            expect.anything(),
        )
    })

    it('should navigate to new workflow page when goToNewWorkflowPage is called', () => {
        renderWithRouter(<WorkflowTemplatesViewContainer />)

        const { goToNewWorkflowPage } =
            WorkflowTemplatesViewMock.mock.calls[0][0]

        goToNewWorkflowPage()

        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/automation/test-shop-type/test-shop-name/flows/new?from=templates',
        )
    })

    it('should navigate to new workflow from template page when goToNewWorkflowFromTemplatePage is called', () => {
        renderWithRouter(<WorkflowTemplatesViewContainer />)

        const { goToNewWorkflowFromTemplatePage } =
            WorkflowTemplatesViewMock.mock.calls[0][0]

        goToNewWorkflowFromTemplatePage('test-template')

        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/automation/test-shop-type/test-shop-name/flows/new?template=test-template&from=templates',
        )
    })
})
