import React from 'react'

import { screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { assumeMock, renderWithRouter } from 'utils/testing'

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

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))
jest.mock('settings/automate/hooks/useAutomateBaseURL', () => ({
    useAutomateBaseURL: jest.fn(),
}))
jest.mock('state/billing/selectors')
jest.mock('../WorkflowTemplatesView', () =>
    jest.fn(() => <div data-testid="workflow-templates-view" />),
)

const useAppSelectorMock = assumeMock(useAppSelector)
const useIsAutomateSettingsMock = assumeMock(useIsAutomateSettings)
const useAutomateBaseURLMock = assumeMock(useAutomateBaseURL)
const WorkflowTemplatesViewMock = assumeMock(WorkflowTemplatesView)
const historyPushMock = jest.fn()

describe('WorkflowTemplatesViewContainer', () => {
    beforeEach(() => {
        // Default mock implementations
        useIsAutomateSettingsMock.mockReturnValue(false)
        useAutomateBaseURLMock.mockReturnValue('/app/settings')

        // Mock useAppSelector to return true for hasAutomate by default
        useAppSelectorMock.mockReturnValue(true)

        // Mock history
        require('react-router-dom').useHistory.mockReturnValue({
            push: historyPushMock,
        })
    })

    it('should redirect when user does not have automate', () => {
        // Set hasAutomate to false
        useAppSelectorMock.mockReturnValue(false)

        renderWithRouter(<WorkflowTemplatesViewContainer />)

        // Check if Redirect component is rendered with correct props
        const redirectElement = screen.getByTestId('redirect')
        expect(redirectElement).toBeInTheDocument()
        expect(redirectElement).toHaveAttribute('data-to', '/app/settings')
    })

    it('should render WorkflowTemplatesView when user has automate', () => {
        renderWithRouter(<WorkflowTemplatesViewContainer />)

        // Check if WorkflowTemplatesView is rendered
        expect(
            screen.getByTestId('workflow-templates-view'),
        ).toBeInTheDocument()

        // Check if WorkflowTemplatesView is called with correct props
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
        // Set isAutomateSettings to true
        useIsAutomateSettingsMock.mockReturnValue(true)

        renderWithRouter(<WorkflowTemplatesViewContainer />)

        // Check if WorkflowTemplatesView is called with correct URL
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

        // Get the goToNewWorkflowPage function from props
        const { goToNewWorkflowPage } =
            WorkflowTemplatesViewMock.mock.calls[0][0]

        // Call the function
        goToNewWorkflowPage()

        // Check if history.push was called with correct URL
        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/automation/test-shop-type/test-shop-name/flows/new?from=templates',
        )
    })

    it('should navigate to new workflow from template page when goToNewWorkflowFromTemplatePage is called', () => {
        renderWithRouter(<WorkflowTemplatesViewContainer />)

        // Get the goToNewWorkflowFromTemplatePage function from props
        const { goToNewWorkflowFromTemplatePage } =
            WorkflowTemplatesViewMock.mock.calls[0][0]

        // Call the function with a template slug
        goToNewWorkflowFromTemplatePage('test-template')

        // Check if history.push was called with correct URL
        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/automation/test-shop-type/test-shop-name/flows/new?template=test-template&from=templates',
        )
    })
})
