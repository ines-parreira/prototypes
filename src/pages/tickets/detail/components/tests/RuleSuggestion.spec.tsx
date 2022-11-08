import React from 'react'

import {fireEvent, screen, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {resetLDMocks, mockFlags} from 'jest-launchdarkly-mock'
import {emailTicket} from 'state/ticket/tests/fixtures'
import {toJS} from 'utils'
import {billingState} from 'fixtures/billing'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {FeatureFlagKey} from 'config/featureFlags'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {sendTicketMessage} from 'state/newMessage/actions'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import RuleSuggestion from '../RuleSuggestion'

jest.mock('state/newMessage/actions.ts')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = {
    currentUser: fromJS(agents[0]),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            status: 'active',
            products: automationSubscriptionProductPrices,
        },
    }),
    billing: fromJS({...billingState}),
    entities: {
        ruleRecipes: {
            [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture,
        },
    },
    integrations: fromJS(integrationsState),
}

const ticket = {
    ...emailTicket.toJS(),
    meta: {
        rule_suggestion: {
            slug: emptyRuleRecipeFixture.slug,
            actions: [
                {name: 'addTags', args: {tags: 'auto-close'}},
                {
                    name: 'replyToTicket',
                    args: {
                        body_text: 'Text coming from rule suggestion',
                        body_html:
                            '<div>Text coming from rule suggestion</div>',
                    },
                },
            ],
        },
    },
}

const minProps = {
    ticket,
}

describe('RuleSuggestion', () => {
    beforeEach(() => {
        ;(sendTicketMessage as jest.Mock).mockReset()
        resetLDMocks()
        mockFlags({[FeatureFlagKey.RuleSuggestion]: true})
    })

    it('should display RuleSuggestion', () => {
        const {container} = render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should not display RuleSuggestion (feature flag false)', () => {
        mockFlags({[FeatureFlagKey.RuleSuggestion]: false})

        const {container} = render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should not display RuleSuggestion (no addon)', () => {
        const noAddonStore = {...store, currentAccount: fromJS({...account})}
        const {container} = render(
            <Provider store={mockStore(noAddonStore)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should not display RuleSuggestion (no suggestion)', () => {
        const {container} = render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion ticket={toJS(emailTicket)} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should send internal note because no text in suggestion', () => {
        const ticket = {
            ...emailTicket.toJS(),
            meta: {
                rule_suggestion: {
                    slug: emptyRuleRecipeFixture.slug,
                    actions: [{name: 'addTags', args: {tags: 'auto-close'}}],
                },
            },
        }

        render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion ticket={ticket} />
            </Provider>
        )

        fireEvent.click(screen.getByRole('button'))
        expect((sendTicketMessage as jest.Mock).mock.calls).toMatchSnapshot()
    })

    it('should send message', () => {
        render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )

        fireEvent.click(screen.getByRole('button'))
        expect((sendTicketMessage as jest.Mock).mock.calls).toMatchSnapshot()
    })
})
