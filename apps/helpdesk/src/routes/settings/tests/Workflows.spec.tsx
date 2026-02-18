import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import SatisfactionSurveyView from 'pages/settings/satisfactionSurveys/SatisfactionSurveyView'
import ManageTags from 'pages/settings/tags/ManageTags'
import TicketAssignment from 'pages/settings/ticketAssignment/TicketAssignment'

import { ConditionalFields } from '../ConditionalFields'
import { CustomFields } from '../CustomFields'
import { Macros } from '../Macros'
import { Rules } from '../Rules'
import { SLA } from '../SLA'
import {
    PaywalledArticleRecommendations,
    PaywalledFlows,
    PaywalledOrderManagement,
    WorkflowsRoutes,
} from '../Workflows'

jest.mock('../SLA', () => ({
    SLA: jest.fn(() => <div>SLA</div>),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
    Link: jest.fn(() => <div>Link</div>),
}))

jest.mock('settings/automate', () => ({
    AutomatePaywall: ({ children }: { children: ReactNode }) => (
        <>
            <div>AutomatePaywall</div>
            {children}
        </>
    ),
}))

jest.mock('settings/pages', () => ({
    ArticleRecommendationsSettings: () => (
        <div>ArticleRecommendationsSettings</div>
    ),
    FlowsSettings: () => <div>FlowsSettings</div>,
    OrderManagementSettings: () => <div>OrderManagementSettings</div>,
}))

jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn((Component: () => JSX.Element) => <Component />),
}))

const mockedRoute = Route as jest.Mock
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'workflows'

const testingMap = [
    {
        callOrder: 1,
        exact: undefined,
        path: `${basePath}/customer-fields`,
        component: CustomFields,
    },
    {
        callOrder: 2,
        exact: undefined,
        path: `${basePath}/ticket-fields`,
        component: CustomFields,
    },
    {
        callOrder: 3,
        exact: undefined,
        path: `${basePath}/ticket-field-conditions`,
        component: ConditionalFields,
    },
    {
        callOrder: 4,
        exact: undefined,
        path: `${basePath}/macros`,
        component: Macros,
    },
    {
        callOrder: 5,
        exact: undefined,
        path: `${basePath}/rules`,
        component: Rules,
    },
    {
        callOrder: 6,
        exact: undefined,
        path: `${basePath}/sla`,
        component: SLA,
    },
    {
        callOrder: 7,
        exact: true,
        path: `${basePath}/manage-tags`,
        component: ManageTags,
    },
    {
        callOrder: 8,
        exact: true,
        path: `${basePath}/ticket-assignment`,
        component: TicketAssignment,
    },
    {
        callOrder: 9,
        exact: true,
        path: `${basePath}/auto-merge`,
        component: AutoMergeSettings,
    },
    {
        callOrder: 10,
        exact: undefined,
        path: `${basePath}/article-recommendations/:shopType?/:shopName?`,
        component: PaywalledArticleRecommendations,
    },
    {
        callOrder: 11,
        exact: undefined,
        path: `${basePath}/flows/:shopType?/:shopName?`,
        component: PaywalledFlows,
    },
    {
        callOrder: 12,
        exact: undefined,
        path: `${basePath}/order-management/:shopType?/:shopName?`,
        component: PaywalledOrderManagement,
    },
    {
        callOrder: 13,
        exact: true,
        path: `${basePath}/satisfaction-surveys`,
        component: SatisfactionSurveyView,
    },
]

describe('Workflows', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call renderer and Route according to the testing map', () => {
        render(<WorkflowsRoutes />)

        testingMap.forEach(({ callOrder, exact, path, component }) => {
            expect(mockedRoute.mock.calls[callOrder]).toEqual([
                {
                    children: expect.objectContaining({
                        type: component,
                    }),
                    path,
                    ...(exact ? { exact } : {}),
                },
                {},
            ])
        })
    })

    it('should render the paywall around article recommendations', () => {
        render(<PaywalledArticleRecommendations />)
        expect(screen.getByText('AutomatePaywall')).toBeInTheDocument()
        expect(
            screen.getByText('ArticleRecommendationsSettings'),
        ).toBeInTheDocument()
    })

    it('should render the paywall around flows', () => {
        render(<PaywalledFlows />)
        expect(screen.getByText('AutomatePaywall')).toBeInTheDocument()
        expect(screen.getByText('FlowsSettings')).toBeInTheDocument()
    })

    it('should render the paywall around order management', () => {
        render(<PaywalledOrderManagement />)
        expect(screen.getByText('AutomatePaywall')).toBeInTheDocument()
        expect(screen.getByText('OrderManagementSettings')).toBeInTheDocument()
    })
})
