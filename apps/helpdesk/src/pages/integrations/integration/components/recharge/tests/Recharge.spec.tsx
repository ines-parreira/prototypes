import type { ComponentProps } from 'react'

import { featureFlagsClientMock } from '@repo/feature-flags/testing'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'

import Recharge from '../Recharge'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)

mockUseAiAgentAccess.mockReturnValue({
    hasAccess: true,
    isLoading: false,
})

const mockStore = configureMockStore([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                type: 'shopify',
                name: 'myShop1',
                meta: { shop_name: 'myShop1' },
            },
            {
                type: 'shopify',
                name: 'myShop2',
                meta: { shop_name: 'myShop2' },
            },
            {
                type: 'recharge',
                name: 'myShop1',
                meta: { store_name: 'myShop1' },
            },
        ],
    }),
})
describe('<Recharge/>', () => {
    const minProps: ComponentProps<typeof Recharge> = {
        integration: fromJS({}),
        integrations: fromJS([
            {
                id: '1',
                type: 'recharge',
                name: 'myShop1',
                meta: { store_name: 'myShop1' },
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }
    describe('Detail', () => {
        it('should render a detail view', () => {
            const { container } = render(<Recharge {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it.each([
            [[], [], 'at least one Shopify'],
            [
                [
                    { type: 'recharge', name: 'myShop1' },
                    { type: 'shopify', name: 'myShop1' },
                ],
                [{ type: 'recharge', name: 'myShop1' }],
                'You are all set',
            ],
        ])(
            'should render the appropriate notification banner and disable buttons',
            (storeIntegrations, rechargeIntegrations, bannerText) => {
                render(
                    <Recharge
                        {...minProps}
                        integrations={fromJS(rechargeIntegrations)}
                    />,
                    {
                        storeState: mockStore({
                            integrations: fromJS({ storeIntegrations }),
                        }).getState() as object,
                    },
                )
                expect(screen.getByText(new RegExp(bannerText)))
                expect(
                    screen.getByRole('button', { name: /Connect/ }),
                ).toHaveProperty('disabled')
            },
        )
    })
    describe('Integration', () => {
        it('should render', () => {
            const { container } = render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/1/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render shopify integrations list', () => {
            const { container } = render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/new/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('List', () => {
        it('should render', () => {
            const { container } = render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/connections/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            render(<Recharge {...minProps} integrations={fromJS([])} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            render(
                <Recharge
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: '1',
                            type: 'recharge',
                            name: 'myShop1',
                            meta: { store_name: 'myShop1' },
                            deactivated_datetime: true,
                        },
                    ])}
                />,
                {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/recharge/connections/`],
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByRole('button', { name: 'Reconnect' }))
        })
    })
    describe('Actions tab (ActionCentralizedLibrary FF)', () => {
        beforeEach(() => {
            mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
                data: [],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof useGetWorkflowConfigurationTemplates
            >)
        })

        afterEach(() => {
            featureFlagsClientMock.allFlags.mockReturnValue({})
            mockUseGetWorkflowConfigurationTemplates.mockReset()
        })

        it('does not render the Actions link when the FF is off', () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'OFF',
            })
            render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.queryByRole('link', { name: 'Actions' })).toBeNull()
        })

        it('renders the Actions link in the SecondaryNavbar when the FF is on', () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/connections/`],
                storeState: store.getState() as object,
            })
            expect(
                screen.getByRole('link', { name: 'Actions' }),
            ).toBeInTheDocument()
        })

        it('renders the AppActionsTab and the Add connection CTA when navigated to /actions with the FF on', () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/actions/`],
                storeState: store.getState() as object,
            })
            expect(
                screen.getByRole('heading', {
                    name: /Gorgias <> Recharge actions/,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Add connection' }),
            ).toBeInTheDocument()
        })

        it('falls back to the Detail view when navigated to /actions with the FF off', () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'OFF',
            })
            render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/actions/`],
                storeState: store.getState() as object,
            })
            expect(
                screen.queryByRole('heading', {
                    name: /Gorgias <> Recharge actions/,
                }),
            ).toBeNull()
            expect(
                screen.queryByRole('button', { name: 'Add connection' }),
            ).toBeNull()
        })
    })
})
