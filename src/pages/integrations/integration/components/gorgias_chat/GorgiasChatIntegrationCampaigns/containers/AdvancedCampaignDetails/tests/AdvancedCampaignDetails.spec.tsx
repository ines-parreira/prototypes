import React from 'react'
import {fromJS} from 'immutable'

import {render, within, screen, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {act} from 'react-hooks-testing-library'
import {mockFlags} from 'jest-launchdarkly-mock'

import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {User} from 'config/types/user'
import {FeatureFlagKey} from 'config/featureFlags'

import {RootState, StoreDispatch} from 'state/types'

import * as betaTesterHook from '../../../hooks/useIsRevenueBetaTester'

import {ChatCampaign} from '../../../types/Campaign'
import {CampaignTriggerKey} from '../../../types/enums/CampaignTriggerKey.enum'
import {BusinessHoursOperators} from '../../../types/enums/BusinessHoursOperators.enum'
import {CurrentUrlOperators} from '../../../types/enums/CurrentUrlOperators.enum'

import {AdvancedCampaignDetails} from '../AdvancedCampaignDetails'
import {VisitCountOperators} from '../../../types/enums/VisitCountOperators.enum'

const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = {} as RootState

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

const regularMerchantCampaign: ChatCampaign = {
    id: '9bf1de6c-c4bd-4e02-a5e9-7dbdb3ad888b',
    message: {
        author: {
            name: 'Acme Support',
            email: 'hello@acme.gorgias.io',
            avatar_url:
                'https://config.gorgi.us/development/Zr1WE86rb6J4Mvgl/profile/Zr1WE86rb6J4Mvgl/0d18d2f5-97c0-44b5-b192-8c58367c60be.jpeg',
        },
        html: `Hello, first-time visitor! 👋 Thank you for shopping with us, we'd like to offer you free shipping 🚢, please use the code: <strong>FREE_SHIPPING</strong>`,
        text: `Hello, first-time visitor! 👋 Thank you for shopping with us, we'd like to offer you free shipping 🚢, please use the code: FREE_SHIPPING`,
    },
    name: 'Cart value with first time visitor',
    triggers: [
        {
            key: CampaignTriggerKey.CurrentUrl,
            value: '/',
            operator: CurrentUrlOperators.Contains,
        },
    ],
}

const revenueMerchantCampaign: ChatCampaign = {
    ...regularMerchantCampaign,
    triggers: [
        {
            key: CampaignTriggerKey.BusinessHours,
            value: true,
            operator: BusinessHoursOperators.DuringHours,
        },
        {
            key: CampaignTriggerKey.VisitCount,
            value: '3',
            operator: VisitCountOperators.GreaterThan,
        },
        {
            key: CampaignTriggerKey.CurrentUrl,
            value: '/',
            operator: CurrentUrlOperators.Contains,
        },
    ],
}

const shopifyChatIntegration = fromJS({
    type: 'gorgias_chat',
    id: '174',
    meta: {
        shop_type: 'shopify',
    },
})

describe('<AdvancedCampaignDetails />', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.ChatVideoSharingCampaigns]: true,
        })
    })

    describe('Creating a campaign as regular merchant', () => {
        beforeEach(() => {
            jest.spyOn(
                betaTesterHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => false)

            render(
                <Provider store={mockStore(defaultState)}>
                    <AdvancedCampaignDetails
                        isRevenueBetaTester={false}
                        id="new"
                        campaign={{} as ChatCampaign}
                        agents={agents as User[]}
                        integration={shopifyChatIntegration}
                        createCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                    />
                </Provider>
            )
        })

        it('shows the "Create & Activate" button', () => {
            screen.getByText('Create & activate')
        })

        it('disables the "Create & Activate" button if the form is empty', () => {
            expect(
                screen.getByText('Create & activate').hasAttribute('disabled')
            ).toBeTruthy()
        })

        it('does not show the "Delete" button', () => {
            expect(() => screen.getByText('Delete Campaign')).toThrow()
        })

        it('populates the form with the default triggers', async () => {
            screen.getByText('Current URL')
            screen.getByText('Is')

            const currentUrlValueEl = await screen.findByTestId(
                'current-url-value'
            )
            const value = within(currentUrlValueEl)
                .getByRole('textbox')
                .getAttribute('value')

            expect(value).toEqual('/')
        })

        it('does not show the advanced triggers', () => {
            const addTriggerBtn = screen.getByTestId('btn:add-condition')

            act(() => {
                fireEvent.click(addTriggerBtn)
            })

            // Expected triggers
            screen.getByRole('option', {
                name: /Current URL/i,
            })
            screen.getByRole('option', {
                name: /Time spent on page/i,
            })

            // Not expected triggers
            expect(() =>
                screen.getByRole('option', {
                    name: /Business hours/i,
                })
            ).toThrow()
            expect(() =>
                screen.getByRole('option', {
                    name: /Number of visits/i,
                })
            ).toThrow()
            expect(() =>
                screen.getByRole('option', {
                    name: /Time spent per visit/i,
                })
            ).toThrow()
            expect(() =>
                screen.getByRole('option', {
                    name: /Exit intent/i,
                })
            ).toThrow()
            expect(() =>
                screen.getByRole('option', {
                    name: /Amount added to cart/i,
                })
            ).toThrow()
            expect(() =>
                screen.getByRole('option', {
                    name: /Product tags added to cart/i,
                })
            ).toThrow()
        })
    })

    describe('Updating a campaign as regular merchant', () => {
        beforeEach(() => {
            jest.spyOn(
                betaTesterHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => false)

            render(
                <Provider store={mockStore(defaultState)}>
                    <AdvancedCampaignDetails
                        isRevenueBetaTester={false}
                        id={regularMerchantCampaign.id}
                        campaign={regularMerchantCampaign}
                        agents={agents as User[]}
                        integration={shopifyChatIntegration}
                        createCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                    />
                </Provider>
            )
        })

        afterEach(() => {
            jest.resetAllMocks()
        })

        it('adds the selected trigger', async () => {
            const addTriggerBtn = screen.getByTestId('btn:add-condition')

            act(() => {
                fireEvent.click(addTriggerBtn)
            })

            const triggerOptionItem = screen.getByRole('option', {
                name: /Time spent on page/i,
            })

            act(() => {
                fireEvent.click(triggerOptionItem)
            })

            // Expect the curren trigger
            screen.getByRole('button', {
                name: 'Current URL',
            })
            screen.getByText('Is')

            const currentUrlValueEl = await screen.findByTestId(
                'current-url-value'
            )
            const value = within(currentUrlValueEl)
                .getByRole('textbox')
                .getAttribute('value')

            expect(value).toEqual('/')

            // Expect the new trigger
            screen.getByRole('button', {
                name: 'Time spent on page',
            })
            expect(
                screen
                    .getByRole('textbox', {
                        name: 'Time spent on page seconds',
                    })
                    .getAttribute('value')
            ).toEqual('0')
        })

        it('removes the right trigger', () => {
            const currentUrlTriggerRow = screen.getByTestId(
                'trigger-row-current_url'
            )

            // Expect the curren trigger
            within(currentUrlTriggerRow).getByRole('button', {
                name: 'Current URL',
            })

            // Delete the business hours trigger
            act(() => {
                fireEvent.click(
                    within(currentUrlTriggerRow).getByTestId(
                        'btn-delete-current_url'
                    )
                )
            })

            // Expect it to be removed
            expect(() => {
                screen.getByTestId('trigger-row-current_url')
            }).toThrowError()
        })
    })

    describe('Creating a campaign as revenue beta tester', () => {
        beforeEach(() => {
            jest.spyOn(
                betaTesterHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => true)

            render(
                <Provider store={mockStore(defaultState)}>
                    <AdvancedCampaignDetails
                        isRevenueBetaTester
                        id="new"
                        campaign={{} as ChatCampaign}
                        agents={agents as User[]}
                        integration={shopifyChatIntegration}
                        createCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                    />
                </Provider>
            )
        })

        it('allows advanced triggers to be added', async () => {
            const addTriggerBtn = screen.getByTestId('btn:add-condition')

            act(() => {
                fireEvent.click(addTriggerBtn)
            })

            // Expected triggers
            screen.getByRole('option', {
                name: /Current URL/i,
            })
            screen.getByRole('option', {
                name: /Time spent on page/i,
            })
            screen.getByRole('option', {
                name: /Business hours/i,
            })
            screen.getByRole('option', {
                name: /Number of visits/i,
            })
            screen.getByRole('option', {
                name: /Time spent per visit/i,
            })
            screen.getByRole('option', {
                name: /Exit intent/i,
            })
            screen.getByRole('option', {
                name: /Amount added to cart/i,
            })
            screen.getByRole('option', {
                name: /Product tags added to cart/i,
            })

            const triggerOptionItem = screen.getByText('Number of visits')

            act(() => {
                fireEvent.click(triggerOptionItem)
            })

            screen.getByText('Number Of Visits')
            screen.getByText('is greater than')

            const visitCountValueEl = await screen.findByTestId(
                'visit-count-value'
            )
            const value = within(visitCountValueEl)
                .getByRole('textbox')
                .getAttribute('value')

            expect(value).toEqual('0')
        })
    })

    describe('Updating a campaign as revenue beta tester', () => {
        beforeEach(() => {
            jest.spyOn(
                betaTesterHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => true)

            render(
                <Provider store={mockStore(defaultState)}>
                    <AdvancedCampaignDetails
                        isRevenueBetaTester
                        id={revenueMerchantCampaign.id}
                        campaign={revenueMerchantCampaign}
                        agents={agents as User[]}
                        integration={shopifyChatIntegration}
                        createCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                    />
                </Provider>
            )
        })

        it('adds the selected trigger', () => {
            const addTriggerBtn = screen.getByTestId('btn:add-condition')

            act(() => {
                fireEvent.click(addTriggerBtn)
            })

            const triggerOptionItem = screen.getByText('Time spent on page')

            act(() => {
                fireEvent.click(triggerOptionItem)
            })

            // Expect the curren trigger
            screen.getByRole('button', {
                name: 'Business hours',
            })
            screen.getByText('During business hours')

            // Expect the new trigger
            screen.getByRole('button', {
                name: 'Time spent on page',
            })
            expect(
                screen
                    .getByRole('textbox', {
                        name: 'Time spent on page seconds',
                    })
                    .getAttribute('value')
            ).toEqual('0')
        })

        it('removes the right trigger', () => {
            // Expect the curren trigger
            screen.getByRole('button', {
                name: 'Business hours',
            })
            screen.getByText('During business hours')

            // Delete the business hours trigger
            act(() => {
                fireEvent.click(screen.getByTestId('btn-delete-business_hours'))
            })

            // Expect it to be removed
            expect(() => {
                screen.getByRole('button', {
                    name: 'Business hours',
                })
            }).toThrowError()
        })

        it('updates the value of the current trigger', () => {
            act(() => {
                fireEvent.click(screen.getByText('During business hours'))
                fireEvent.click(screen.getByText('Outside business hours'))
            })

            screen.getByText('Outside business hours')
        })

        it('has the current agent assigned', () => {
            const agentsContainer = within(
                screen.getByTestId('campaign-agent-section')
            )

            agentsContainer.getByText(
                revenueMerchantCampaign.message.author?.name as string
            )

            expect(
                agentsContainer
                    .getByRole('img', {name: 'avatar'})
                    .getAttribute('src')
            ).toEqual(
                revenueMerchantCampaign.message.author?.avatar_url as string
            )
        })

        it('changes the author to a random agent', () => {
            const agentsContainer = within(
                screen.getByTestId('campaign-agent-section')
            )

            act(() => {
                fireEvent.click(
                    agentsContainer.getByText(
                        revenueMerchantCampaign.message.author?.name as string
                    )
                )
                fireEvent.click(agentsContainer.getByText('Random agent'))
            })

            agentsContainer.getByText('Random agent')
            agentsContainer.getByText('Ra')
        })

        it('changes the author to another agent', () => {
            const agentsContainer = within(
                screen.getByTestId('campaign-agent-section')
            )

            act(() => {
                fireEvent.click(
                    agentsContainer.getByText(
                        revenueMerchantCampaign.message.author?.name as string
                    )
                )
                fireEvent.click(agentsContainer.getByText('Alex Plugaru'))
            })

            agentsContainer.getByText('Alex Plugaru')
            agentsContainer.getByText('AP')
        })

        it('shows and enables the "Save" button', () => {
            expect(
                screen
                    .getByRole('button', {name: 'Save'})
                    .hasAttribute('disabled')
            ).toBeFalsy()
        })

        it('disables the "Save" button if the form is not valid', () => {
            act(() => {
                userEvent.clear(
                    screen.getByRole('textbox', {name: 'Campaign name'})
                )
            })

            expect(
                screen
                    .getByRole('button', {name: 'Save'})
                    .hasAttribute('disabled')
            ).toBeTruthy()
        })
    })

    describe('Updating a campaign as previous revenue beta tester', () => {
        beforeEach(() => {
            jest.spyOn(
                betaTesterHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => false)

            render(
                <Provider store={mockStore(defaultState)}>
                    <AdvancedCampaignDetails
                        isRevenueBetaTester={false}
                        id={revenueMerchantCampaign.id}
                        campaign={revenueMerchantCampaign}
                        agents={agents as User[]}
                        integration={shopifyChatIntegration}
                        createCampaign={jest.fn()}
                        updateCampaign={jest.fn()}
                        deleteCampaign={jest.fn()}
                    />
                </Provider>
            )
        })

        it('has the advanced triggers under paywall', () => {
            const visitCountTrigger = screen.getByTestId(
                'trigger-row-visit_count'
            )
            const businessHoursTrigger = screen.getByTestId(
                'trigger-row-business_hours'
            )

            within(visitCountTrigger).getByTestId('paywall-visit_count')
            within(businessHoursTrigger).getByTestId('paywall-business_hours')
        })
    })
})
