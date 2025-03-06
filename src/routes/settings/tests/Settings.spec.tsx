import React from 'react'
import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import IntegrationDetail from 'pages/integrations/integration/Integration'
import {
    CUSTOM_FIELD_CONDITIONS_ROUTE,
    CUSTOM_FIELD_ROUTES,
} from 'routes/constants'
import { assumeMock } from 'utils/testing'

import { Billing } from '../Billing'
import { Channels } from '../Channels'
import { ConditionalFields } from '../ConditionalFields'
import { ContactForm } from '../ContactForm'
import { Convert } from '../Convert'
import { CustomFields } from '../CustomFields'
import { HelpCenter } from '../HelpCenter'
import { renderAppSettings } from '../helpers/settingsRenderer'
import { Import } from '../Import'
import { Integrations } from '../Integrations'
import { Macros } from '../Macros'
import { PhoneNumbers } from '../PhoneNumbers'
import { Rules } from '../Rules'
import {
    PaywalledArticleRecommendations,
    PaywalledFlows,
    PaywalledOrderManagement,
    SettingRoutes,
} from '../Settings'
import { SLA } from '../SLA'
import { Teams } from '../Teams'
import { Users } from '../Users'

jest.mock('../SLA', () => ({
    SLA: jest.fn(() => <div>SLA</div>),
}))

jest.mock('react-router-dom', () => ({
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
const mockedRenderAppSettings = assumeMock(renderAppSettings)

const basePath = 'settings'

const testingMap = [
    {
        callOrder: 0,
        exact: true,
        path: `${basePath}/`,
        component: IntegrationDetail,
        renderHelperProps: {
            roleParams: [
                ADMIN_ROLE,
                PageSection.Channels,
                `${basePath}/help-center`,
            ],
        },
        renderHelperCallOrder: 0,
    },
    {
        callOrder: 1,
        exact: undefined,
        path: `${basePath}/billing`,
        component: Billing,
    },
    {
        callOrder: 2,
        exact: undefined,
        path: `${basePath}/channels`,
        component: Channels,
    },
    {
        callOrder: 3,
        exact: undefined,
        path: `${basePath}/contact-form`,
        component: ContactForm,
    },
    {
        callOrder: 4,
        exact: undefined,
        path: `${basePath}/convert`,
        component: Convert,
    },
    {
        callOrder: 5,
        exact: undefined,
        path: `${basePath}/${CUSTOM_FIELD_ROUTES['Customer']}`,
        component: CustomFields,
    },
    {
        callOrder: 6,
        exact: undefined,
        path: `${basePath}/${CUSTOM_FIELD_ROUTES['Ticket']}`,
        component: CustomFields,
    },
    {
        callOrder: 7,
        exact: undefined,
        path: `${basePath}/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        component: ConditionalFields,
    },
    {
        callOrder: 8,
        exact: undefined,
        path: `${basePath}/help-center`,
        component: HelpCenter,
    },
    {
        callOrder: 9,
        exact: undefined,
        path: `${basePath}/import-data`,
        component: Import,
    },
    {
        callOrder: 10,
        exact: undefined,
        path: `${basePath}/integrations`,
        component: Integrations,
    },
    {
        callOrder: 11,
        exact: undefined,
        path: `${basePath}/phone-numbers`,
        component: PhoneNumbers,
    },
    {
        callOrder: 12,
        exact: undefined,
        path: `${basePath}/macros`,
        component: Macros,
    },
    {
        callOrder: 13,
        exact: undefined,
        path: `${basePath}/rules`,
        component: Rules,
    },
    {
        callOrder: 14,
        exact: undefined,
        path: `${basePath}/sla`,
        component: SLA,
    },
    {
        callOrder: 15,
        exact: undefined,
        path: `${basePath}/article-recommendations/:shopType?/:shopName?`,
        component: PaywalledArticleRecommendations,
    },
    {
        callOrder: 16,
        exact: undefined,
        path: `${basePath}/flows/:shopType?/:shopName?`,
        component: PaywalledFlows,
    },
    {
        callOrder: 17,
        exact: undefined,
        path: `${basePath}/order-management/:shopType?/:shopName?`,
        component: PaywalledOrderManagement,
    },
    {
        callOrder: 18,
        exact: undefined,
        path: `${basePath}/teams`,
        component: Teams,
    },
    {
        callOrder: 19,
        exact: undefined,
        path: `${basePath}/users`,
        component: Users,
    },
]

describe('Settings', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call renderer and Route according to the testing map ', () => {
        render(<SettingRoutes />)

        testingMap.forEach(
            ({
                callOrder,
                exact,
                path,
                component,
                renderHelperProps,
                renderHelperCallOrder,
            }) => {
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
                if (renderHelperProps) {
                    expect(
                        mockedRenderAppSettings.mock.calls[
                            renderHelperCallOrder
                        ],
                    ).toEqual([component, renderHelperProps])
                }
            },
        )
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
