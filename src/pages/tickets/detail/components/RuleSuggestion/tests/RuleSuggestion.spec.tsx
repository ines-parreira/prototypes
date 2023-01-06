import React from 'react'

import {fireEvent, screen, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {resetLDMocks, mockFlags} from 'jest-launchdarkly-mock'
import {useMeasure} from 'react-use'
import {emailTicket} from 'state/ticket/tests/fixtures'
import {toJS} from 'utils'
import {billingState} from 'fixtures/billing'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {FeatureFlagKey} from 'config/featureFlags'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {sendTicketMessage} from 'state/newMessage/actions'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {emptyManagedRule, emptyRule} from 'fixtures/rule'
import {UserRole} from 'config/types/user'
import RuleSuggestion from '../RuleSuggestion'

jest.mock('state/newMessage/actions.ts')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())

jest.mock('react-use', () => {
    const originalModule = jest.requireActual('react-use')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        __esModule: true,
        ...originalModule,
        useMeasure: jest.fn().mockImplementation(() => [undefined, 0]),
    }
})

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
        rules: {[emptyRule.id]: emptyRule},
        ruleRecipes: {[emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture},
    },
    integrations: fromJS(integrationsState),
    ui: {editor: {isFocused: false}},
    ticket: fromJS({_internal: {isPartialUpdating: false}}),
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
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllTimers()
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

        fireEvent.click(screen.getByText('Apply & Send'))
        expect((sendTicketMessage as jest.Mock).mock.calls).toMatchSnapshot()

        const placeholder = screen.queryByText('(No reply will be sent)')
        expect(placeholder).not.toBeNull()
    })

    it('should send message', () => {
        render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )

        const button = screen.getByText('Apply & Send')
        fireEvent.click(button)
        expect((sendTicketMessage as jest.Mock).mock.calls).toMatchSnapshot()
        expect(button.className.includes('isDisabled')).toBeTruthy()
    })

    it('should display in preview for large suggestion body', async () => {
        const bodyHeight = 150
        ;(useMeasure as jest.Mock).mockImplementation(() => [
            undefined,
            bodyHeight,
        ])

        const {container} = render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )

        fireEvent.click(await screen.findByText('Expand'))
        jest.runAllTimers()
        expect(screen.queryByText('Expand')).toBeNull()
        expect(container).toMatchSnapshot()
    })

    it('should disable install if not admin or lead', () => {
        const liteAgentStore = {
            ...store,
            currentUser: fromJS({
                ...agents[0],
                role: {name: UserRole.LiteAgent},
            }),
        }
        render(
            <Provider store={mockStore(liteAgentStore)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )

        const install = screen.getByText('Install')
        expect(
            Object.values(install.classList).includes('isDisabled')
        ).toBeTruthy()
    })

    it('should display activate if rule already installed', () => {
        const storeWithRule = {
            ...store,
            entities: {
                ...store.entities,
                rules: [
                    {
                        ...emptyManagedRule,
                        settings: {slug: emptyRuleRecipeFixture.slug},
                        deactivated_datetime: '01/01/2022',
                    },
                ],
            },
        }

        render(
            <Provider store={mockStore(storeWithRule)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )
        const activate = screen.getByText('Activate')
        expect(!!activate).toBeTruthy()
    })

    it('should not display install button if rule is installed', () => {
        const storeWithRule = {
            ...store,
            entities: {
                ...store.entities,
                rules: [
                    {
                        ...emptyManagedRule,
                        settings: {slug: emptyRuleRecipeFixture.slug},
                    },
                ],
            },
        }

        render(
            <Provider store={mockStore(storeWithRule)}>
                <RuleSuggestion {...minProps} />
            </Provider>
        )
        const install = screen.queryByText('Install')
        const activate = screen.queryByText('Activate')
        expect(install).toBeNull()
        expect(activate).toBeNull()
    })
})
