import type { ReactNode } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { NotificationsSettings } from 'common/notifications'
import Access from 'pages/settings/access/Access'
import AgentStatuses from 'pages/settings/agentUnavailability/AgentStatuses'
import APIView from 'pages/settings/api/APIView'
import UserAuditList from 'pages/settings/audit/UserAuditList'
import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import BusinessHoursPage from 'pages/settings/businessHours/BusinessHoursPage'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import SatisfactionSurveyView from 'pages/settings/satisfactionSurveys/SatisfactionSurveyView'
import SidebarSettings from 'pages/settings/sidebar/SidebarSettings'
import ManageTags from 'pages/settings/tags/ManageTags'
import TicketAssignment from 'pages/settings/ticketAssignment/TicketAssignment'
import PasswordAnd2FA from 'pages/settings/yourProfile/PasswordAnd2FA'
import YourProfileContainer from 'pages/settings/yourProfile/YourProfileContainer'
import {
    CUSTOM_FIELD_CONDITIONS_ROUTE,
    CUSTOM_FIELD_ROUTES,
} from 'routes/constants'
import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { Product, productConfig } from 'routes/layout/productConfig'

import { Billing } from '../Billing'
import { Channels } from '../Channels'
import { ConditionalFields } from '../ConditionalFields'
import { ContactForm } from '../ContactForm'
import { Convert } from '../Convert'
import { CustomFields } from '../CustomFields'
import { HelpCenter } from '../HelpCenter'
import { HistoricalImportsRoute } from '../HistoricalImportsRoute'
import { ImportEmailsRoute } from '../ImportEmailsRoute'
import { ImportZendeskRoute } from '../ImportZendeskRoute'
import { Integrations } from '../Integrations'
import { Macros } from '../Macros'
import { PhoneNumbers } from '../PhoneNumbers'
import { Rules } from '../Rules'
import {
    PaywalledArticleRecommendations,
    PaywalledAutomate,
    PaywalledFlows,
    PaywalledOrderManagement,
    SettingRoutes,
} from '../Settings'
import { SLA } from '../SLA'
import { StoreManagement } from '../StoreManagement'
import { Teams } from '../Teams'
import { Users } from '../Users'

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

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    HelpCenterApiClientProvider: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
}))

jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn((Component: () => JSX.Element) => <Component />),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))

jest.mock('routes/hooks/useCurrentRouteProduct', () => ({
    useCurrentRouteProduct: jest.fn(),
}))

jest.mock('routes/settings/Workflows', () => ({
    WorkflowsRoutes: () => <div>WorkflowsRoutes</div>,
}))
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => ({
        isStandaloneAiAgent: false,
        accessFeaturesMapped: {
            statistics: { canRead: true, canWrite: true },
            userManagement: { canRead: true, canWrite: true },
        },
    })),
}))

const mockedRoute = Route as jest.Mock
const mockedUseRouteMatch = assumeMock(useRouteMatch)
const mockedUseHelpdeskV2WayfindingMS1Flag = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)
const mockedUseCurrentRouteProduct = assumeMock(useCurrentRouteProduct)

const basePath = 'settings'

const testingMap = [
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
        path: `${basePath}/integrations`,
        component: Integrations,
    },
    {
        callOrder: 4,
        exact: undefined,
        path: `${basePath}/users`,
        component: Users,
    },
    {
        callOrder: 5,
        exact: true,
        path: `${basePath}/profile`,
        component: YourProfileContainer,
    },
    {
        callOrder: 6,
        exact: true,
        path: `${basePath}/notifications`,
        component: NotificationsSettings,
    },
    {
        callOrder: 7,
        exact: true,
        path: `${basePath}/password-2fa`,
        component: PasswordAnd2FA,
    },
    {
        callOrder: 8,
        exact: true,
        path: `${basePath}/api`,
        component: APIView,
    },
    {
        callOrder: 9,
        exact: true,
        path: `${basePath}/audit`,
        component: UserAuditList,
    },
    {
        callOrder: 10,
        exact: true,
        path: `${basePath}/access`,
        component: Access,
    },
    {
        callOrder: 11,
        exact: undefined,
        path: `${basePath}/store-management`,
        component: StoreManagement,
    },
    {
        callOrder: 12,
        exact: undefined,
        path: `${basePath}/contact-form`,
        component: ContactForm,
    },
    {
        callOrder: 13,
        exact: undefined,
        path: `${basePath}/convert`,
        component: Convert,
    },
    {
        callOrder: 14,
        exact: undefined,
        path: `${basePath}/${CUSTOM_FIELD_ROUTES['Customer']}`,
        component: CustomFields,
    },
    {
        callOrder: 15,
        exact: undefined,
        path: `${basePath}/${CUSTOM_FIELD_ROUTES['Ticket']}`,
        component: CustomFields,
    },
    {
        callOrder: 16,
        exact: undefined,
        path: `${basePath}/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        component: ConditionalFields,
    },
    {
        callOrder: 17,
        exact: undefined,
        path: `${basePath}/help-center`,
        component: HelpCenter,
    },
    {
        callOrder: 18,
        exact: undefined,
        path: `${basePath}/import-zendesk`,
        component: ImportZendeskRoute,
    },
    {
        callOrder: 19,
        exact: undefined,
        path: `${basePath}/import-email`,
        component: ImportEmailsRoute,
    },
    {
        callOrder: 20,
        exact: undefined,
        path: `${basePath}/historical-imports`,
        component: HistoricalImportsRoute,
    },
    {
        callOrder: 21,
        exact: undefined,
        path: `${basePath}/phone-numbers`,
        component: PhoneNumbers,
    },
    {
        callOrder: 22,
        exact: undefined,
        path: `${basePath}/macros`,
        component: Macros,
    },
    {
        callOrder: 23,
        exact: undefined,
        path: `${basePath}/rules`,
        component: Rules,
    },
    {
        callOrder: 24,
        exact: undefined,
        path: `${basePath}/sla`,
        component: SLA,
    },
    {
        callOrder: 25,
        exact: undefined,
        path: `${basePath}/teams`,
        component: Teams,
    },
    {
        callOrder: 26,
        exact: true,
        path: `${basePath}/manage-tags`,
        component: ManageTags,
    },
    {
        callOrder: 27,
        exact: true,
        path: `${basePath}/agent-statuses`,
        component: AgentStatuses,
    },
    {
        callOrder: 28,
        exact: undefined,
        path: `${basePath}/business-hours`,
        component: BusinessHoursPage,
    },
    {
        callOrder: 29,
        exact: undefined,
        path: `${basePath}/sidebar`,
        component: SidebarSettings,
    },
    {
        callOrder: 30,
        exact: true,
        path: `${basePath}/ticket-assignment`,
        component: TicketAssignment,
    },
    {
        callOrder: 31,
        exact: true,
        path: `${basePath}/auto-merge`,
        component: AutoMergeSettings,
    },
    {
        callOrder: 32,
        exact: undefined,
        path: `${basePath}/automate`,
        component: PaywalledAutomate,
    },
    {
        callOrder: 33,
        exact: undefined,
        path: `${basePath}/article-recommendations/:shopType?/:shopName?`,
        component: PaywalledArticleRecommendations,
    },
    {
        callOrder: 34,
        exact: undefined,
        path: `${basePath}/flows/:shopType?/:shopName?`,
        component: PaywalledFlows,
    },
    {
        callOrder: 35,
        exact: undefined,
        path: `${basePath}/order-management/:shopType?/:shopName?`,
        component: PaywalledOrderManagement,
    },
    {
        callOrder: 36,
        exact: true,
        path: `${basePath}/satisfaction-surveys`,
        component: SatisfactionSurveyView,
    },
]

describe('Settings', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
        mockedUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)
        mockedUseCurrentRouteProduct.mockReturnValue(
            productConfig[Product.Settings],
        )
    })

    it('should call HelpCenterApiClientProvider', () => {
        render(<SettingRoutes />)

        expect(HelpCenterApiClientProvider).toHaveBeenCalled()
    })

    it('should call renderer and Route according to the testing map ', () => {
        render(<SettingRoutes />)

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

    it('should render WorkflowsRoutes when wayfinding flag is enabled and current product is Workflows', () => {
        mockedUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        mockedUseCurrentRouteProduct.mockReturnValue(
            productConfig[Product.Workflows],
        )

        render(<SettingRoutes />)
        expect(screen.getByText('WorkflowsRoutes')).toBeInTheDocument()
    })

    it('should render regular settings routes when wayfinding flag is disabled', () => {
        mockedUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)
        mockedUseCurrentRouteProduct.mockReturnValue(
            productConfig[Product.Workflows],
        )

        render(<SettingRoutes />)
        expect(screen.queryByText('WorkflowsRoutes')).not.toBeInTheDocument()
        expect(HelpCenterApiClientProvider).toHaveBeenCalled()
    })

    it('should render regular settings routes when current product is not Workflows', () => {
        mockedUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        mockedUseCurrentRouteProduct.mockReturnValue(
            productConfig[Product.Settings],
        )

        render(<SettingRoutes />)
        expect(screen.queryByText('WorkflowsRoutes')).not.toBeInTheDocument()
        expect(HelpCenterApiClientProvider).toHaveBeenCalled()
    })
})
