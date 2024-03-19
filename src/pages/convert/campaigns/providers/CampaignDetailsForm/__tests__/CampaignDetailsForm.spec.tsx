import React from 'react'
import {RenderResult, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {User} from 'config/types/user'

import {getLDClient} from 'utils/launchDarkly'

import {integrationsState} from 'fixtures/integrations'

import {RootState, StoreDispatch} from 'state/types'

import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {campaign as campaignFixture} from 'fixtures/campaign'
import {toJS} from 'utils'
import {CampaignDetailsForm} from '../CampaignDetailsForm'

import {Campaign} from '../../../types/Campaign'

jest.mock('utils/launchDarkly')
jest.mock('pages/common/forms/RichField/RichFieldEditor')
jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')
jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)
const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = {integrations: fromJS(integrationsState)} as RootState

const agents = [
    {
        id: 1,
        name: 'Acme Support',
        email: 'hello@acme.gorgias.io',
        meta: {
            profile_picture_url:
                'https://config.gorgi.us/development/Zr1WE86rb6J4Mvgl/profile/Zr1WE86rb6J4Mvgl/0d18d2f5-97c0-44b5-b192-8c58367c60be.jpeg',
        },
    },
    {
        id: 2,
        meta: {},
        name: 'Alex Plugaru',
        email: 'alex@gorgias.io',
    },
    {
        id: 3,
        name: 'Bob Smith',
        email: 'agent-smith@gorgias.io',
        meta: {},
    },
]

const shopifyChatIntegration = fromJS({
    type: 'gorgias_chat',
    id: '174',
    meta: {
        shop_type: 'shopify',
    },
})

const shopifyIntegration = fromJS({
    type: 'shopify',
    id: '1',
})

const campaign = fromJS(campaignFixture)

describe('<CampaignDetailsForm />', () => {
    beforeEach(() => {
        mockFlags({})

        const allFlagsMock = getLDClient().allFlags as jest.Mock
        allFlagsMock.mockReturnValue({})

        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)
    })

    describe('Create campaign', () => {
        let result: RenderResult
        beforeEach(() => {
            result = render(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm
                        agents={agents as User[]}
                        campaign={{} as Campaign}
                        integration={shopifyChatIntegration}
                        shopifyIntegration={shopifyIntegration}
                        isLoading={false}
                        createCampaign={jest.fn()}
                        duplicateCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                        backUrl={'/back'}
                    />
                </Provider>
            )
        })

        it('renders all 3 steps', () => {
            expect(screen.getByText('Set up the basics')).toBeInTheDocument()
            expect(screen.getByText('Choose your audience')).toBeInTheDocument()
            expect(screen.getByText('Write your message')).toBeInTheDocument()
        })

        it('opens the Basics step by default', () => {
            expect(screen.getByText('Campaign name')).toBeInTheDocument()
        })

        it('disables the button until the form is valid', () => {
            expect(screen.getByText('Create')).toHaveAttribute(
                'aria-disabled',
                'true'
            )

            result.rerender(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm
                        agents={agents as User[]}
                        campaign={toJS(campaign)}
                        integration={shopifyChatIntegration}
                        shopifyIntegration={shopifyIntegration}
                        isLoading={false}
                        createCampaign={jest.fn()}
                        duplicateCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                        backUrl={'/back'}
                    />
                </Provider>
            )

            expect(screen.getByText('Create')).toHaveAttribute(
                'aria-disabled',
                'false'
            )
        })
    })

    describe('Edit campaign', () => {
        beforeEach(() => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <CampaignDetailsForm
                        agents={agents as User[]}
                        campaign={{} as Campaign}
                        isEditMode
                        isLoading={false}
                        integration={shopifyChatIntegration}
                        shopifyIntegration={shopifyIntegration}
                        createCampaign={jest.fn()}
                        duplicateCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                        backUrl={'/back'}
                    />
                </Provider>
            )
        })

        it('renders all 3 steps', () => {
            expect(screen.getByText('Set up the basics')).toBeInTheDocument()
            expect(screen.getByText('Choose your audience')).toBeInTheDocument()
            expect(screen.getByText('Write your message')).toBeInTheDocument()
        })

        it('opens the Basics step by default', () => {
            expect(screen.getByText('Add condition')).toBeInTheDocument()
        })
    })
})
