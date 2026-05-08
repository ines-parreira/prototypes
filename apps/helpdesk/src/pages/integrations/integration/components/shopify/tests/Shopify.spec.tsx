import type { ComponentProps } from 'react'
import React from 'react'

import { featureFlagsClientMock } from '@repo/feature-flags/testing'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'

import Shopify from '../Shopify'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)

const mockStore = configureMockStore([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    integrations: fromJS({ integrations: [] }),
})
describe('<Shopify/>', () => {
    const minProps: ComponentProps<typeof Shopify> = {
        integration: fromJS({}),
        integrations: fromJS([
            {
                id: '1',
                type: 'shopify',
                name: 'myShop1',
                meta: { shop_name: 'myShop1' },
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }
    describe('Detail', () => {
        it('should render a detail view', () => {
            const { container } = render(<Shopify {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('Integration', () => {
        it('should render', () => {
            const { container } = render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/1/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('List', () => {
        it('should render', () => {
            const { container } = render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/connections/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            render(<Shopify {...minProps} integrations={fromJS([])} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            render(
                <Shopify
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: '1',
                            type: 'Shopify',
                            name: 'myShop1',
                            meta: { shop_id: '1337' },
                            deactivated_datetime: true,
                        },
                    ])}
                />,
                {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/shopify/connections/`],
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
            render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.queryByRole('link', { name: 'Actions' })).toBeNull()
        })

        it('renders the Actions link in the SecondaryNavbar when the FF is on', () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/connections/`],
                storeState: store.getState() as object,
            })
            expect(
                screen.getByRole('link', { name: 'Actions' }),
            ).toBeInTheDocument()
        })

        it('renders the AppActionsTab and the Add new connection CTA when navigated to /actions with the FF on', () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'MILESTONE-1',
            })
            render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/actions/`],
                storeState: store.getState() as object,
            })
            expect(
                screen.getByRole('heading', {
                    name: /Gorgias <> Shopify actions/,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Add new connection' }),
            ).toBeInTheDocument()
        })

        it('falls back to the Detail view when navigated to /actions with the FF off', () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                'action-centralized-library': 'OFF',
            })
            render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/actions/`],
                storeState: store.getState() as object,
            })
            expect(
                screen.queryByRole('heading', {
                    name: /Gorgias <> Shopify actions/,
                }),
            ).toBeNull()
            expect(
                screen.queryByRole('button', { name: 'Add new connection' }),
            ).toBeNull()
        })
    })
})
