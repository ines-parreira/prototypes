import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {IntegrationType} from 'models/integration/constants'
import {ManagedRulesSlugs} from 'state/rules/types'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import AutoReplyWismoEditor from '../AutoReplyWismoEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

const mockSelfServiceConfigurations = [
    {
        id: 1,
        type: IntegrationType.Shopify,
        shopName: 'test-shop',
        createdDatetime: '2023-11-15 19:00:00.000000',
        updatedDatetime: '2023-11-15 19:00:00.000000',
        deactivatedDatetime: null,
        reportIssuePolicy: {
            enabled: true,
            cases: [],
        },
        trackOrderPolicy: {
            enabled: true,
            unfulfilledMessage: {
                text: '',
                html: '',
            },
        },
        cancelOrderPolicy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        returnOrderPolicy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        articleRecommendationHelpCenterId: null,
    },
]

describe('<AutoReplyWismoEditor/>', () => {
    const minProps: ComponentProps<typeof AutoReplyWismoEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoReplyWismo,
            block_list: [],
            body_text: '{{tracking_link_url}}',
            signature_text: '{{current_user.name}}',
        },
        onChange: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const entities = {
        ruleRecipes: {
            [ManagedRulesSlugs.AutoReplyWismo as string]:
                emptyRuleRecipeFixture,
        },
        helpCenter: {articles: {}, categories: {}, helpCenters: {}},
    }

    it('should render correctly', () => {
        const store = mockStore({
            entities: entities,
            integrations: fromJS({
                integrations: [{type: IntegrationType.Shopify, meta: {}}],
            }),
            billing: fromJS({products: []}),
        } as RootState)
        const {container} = render(
            <Provider store={store}>
                <QueryClientProvider client={mockQueryClient()}>
                    <AutoReplyWismoEditor {...minProps} />
                </QueryClientProvider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display an alert if no shopify integration', () => {
        const store = mockStore({
            entities: entities,
            integrations: fromJS({
                integrations: [],
            }),
            billing: fromJS({products: []}),
        } as RootState)
        const {container} = render(
            <Provider store={store}>
                <QueryClientProvider client={mockQueryClient()}>
                    <AutoReplyWismoEditor {...minProps} />
                </QueryClientProvider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display an alert if track order flow is enabled without unfulffiled message', async () => {
        const store = mockStore({
            entities: {
                ...entities,
            },
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'shopify',
                    },
                ],
            }),
            billing: fromJS({products: []}),
        } as unknown as RootState)

        const useGetSelfServiceConfigurationsMock = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('models/selfServiceConfiguration/queries'),
            'useGetSelfServiceConfigurations'
        )

        useGetSelfServiceConfigurationsMock.mockImplementationOnce(() => ({
            data: mockSelfServiceConfigurations,
            isLoading: false,
        }))

        render(
            <Provider store={store}>
                <QueryClientProvider client={mockQueryClient()}>
                    <AutoReplyWismoEditor {...minProps} />
                </QueryClientProvider>
            </Provider>
        )
        await screen.findByText(
            /add a response for customers tracking unfulfilled orders/i
        )
    })
})
