import React, {ComponentType, ReactNode} from 'react'
import {createBrowserHistory} from 'history'
import {act, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {logPageChange} from 'common/segment'
import {user} from 'fixtures/users'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {useFlag} from 'common/flags'

import Routes from '../routes'

jest.mock('common/segment')
const logPageMock = assumeMock(logPageChange)

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock(
    'pages/App',
    () =>
        ({
            content: Content,
            children,
        }: {
            content?: ComponentType<any>
            children?: ReactNode
        }) =>
            Content ? <Content /> : children
)
jest.mock('pages/PanelLayout', () => () => <div>PanelLayout</div>)
jest.mock('pages/stats/DefaultStatsFilters', () => () => (
    <div>Default stats filters</div>
))
jest.mock('pages/settings/yourProfile/YourProfileContainer', () => () => (
    <div>YourProfileContainer</div>
))
jest.mock('pages/tasks/detail/CreditShopifyBillingIntegration', () => () => (
    <div>CreditShopifyBillingIntegration</div>
))
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformAppsView',
    () => () => <div>ActionsPlatformAppsView</div>
)
jest.mock(
    'pages/automate/actionsPlatform/ActionsPlatformTemplatesView',
    () => () => <div>ActionsPlatformTemplatesView</div>
)
jest.mock(
    'pages/automate/common/components/AutomateLandingPageContainer',
    () => () => <div>AutomateLandingPageContainer</div>
)
jest.mock(
    'pages/convert/onboarding/components/ConvertOnboardingView',
    () => () => <div>ConvertOnboardingView</div>
)
jest.mock(
    'pages/convert/common/components/ConvertNavbar/ConvertNavbar',
    () => () => <div>ConvertNavbar</div>
)
jest.mock('pages/stats/voice/pages/LiveVoice', () => () => <div>LiveVoice</div>)

const mockHistory = createBrowserHistory()
const mockStore = configureMockStore()
const mockUseFlag = useFlag as jest.Mock

describe('<Routes/>', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockHistory.replace('/app')
    })

    afterEach(() => {
        window.USER_IMPERSONATED = null
    })

    it('should not log page change via segment on initial render', () => {
        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {history: mockHistory}
        )
        expect(logPageMock).not.toHaveBeenCalled()
    })

    it('should not log page change after location change', () => {
        renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            }
        )

        act(() => mockHistory.push('/app/settings/profile'))

        expect(logPageMock).not.toHaveBeenCalled()
    })

    it.each(['/app/stats/live-overview', '/app/convert/setup'])(
        'should log page change after location change to a tracked page',
        (path) => {
            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => mockHistory.push(path))

            expect(logPageMock).toHaveBeenCalledTimes(1)
        }
    )

    it('should make Shopify route available for impersonated admin users', () => {
        window.USER_IMPERSONATED = true

        const {container} = renderWithRouter(
            <Provider store={mockStore({currentUser: fromJS(user)})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            }
        )

        act(() =>
            mockHistory.push(
                '/app/admin/tasks/credit-shopify-billing-integration'
            )
        )

        expect(container).toMatchSnapshot()
    })

    it('should not make Shopify route available for non-impersonated users', () => {
        const {container} = renderWithRouter(
            <Provider store={mockStore({})}>
                <Routes />
            </Provider>,
            {
                history: mockHistory,
            }
        )

        act(() =>
            mockHistory.push(
                '/app/admin/tasks/credit-shopify-billing-integration'
            )
        )

        expect(container).toMatchSnapshot()
    })

    describe('actions platform', () => {
        it('should render actions platform templates page if feature flag is toggled on', () => {
            mockUseFlag.mockReturnValue(true)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform')
            })

            expect(
                screen.getByText('ActionsPlatformTemplatesView')
            ).toBeInTheDocument()
        })

        it('should render actions platform apps page if feature flag is toggled on', () => {
            mockUseFlag.mockReturnValue(true)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform/apps')
            })

            expect(
                screen.getByText('ActionsPlatformAppsView')
            ).toBeInTheDocument()
        })

        it('should render not actions platform templates page if feature flag is toggled off', () => {
            mockUseFlag.mockReturnValue(false)

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <Routes />
                </Provider>,
                {
                    history: mockHistory,
                }
            )

            act(() => {
                mockHistory.push('/app/automation/actions-platform')
            })

            expect(
                screen.queryByText('ActionsPlatformTemplatesView')
            ).not.toBeInTheDocument()
        })
    })
})
