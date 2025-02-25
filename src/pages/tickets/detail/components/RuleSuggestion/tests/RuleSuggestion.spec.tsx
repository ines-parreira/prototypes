import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { emptyManagedRule, emptyRule } from 'fixtures/rule'
import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import useElementSize from 'hooks/useElementSize'
import useMeasure from 'hooks/useMeasure'
import { sendTicketMessage } from 'state/newMessage/actions'
import { emailTicket } from 'state/ticket/tests/fixtures'

import RuleSuggestion, {
    getRuleSuggestionContent,
    isSuggestionEmpty,
} from '../RuleSuggestion'

jest.mock('hooks/useElementSize', () => jest.fn())

const useElementSizeMock = useElementSize as jest.Mock
useElementSizeMock.mockReturnValue([0, 160])

jest.mock('state/newMessage/actions.ts')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())

jest.mock('hooks/useMeasure', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => [undefined, 0]),
    }
})

const useFlagsMock = useFlags as jest.Mock

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
    billing: fromJS({ ...billingState }),
    entities: {
        rules: { [emptyRule.id]: emptyRule },
        ruleRecipes: { [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture },
    },
    integrations: fromJS(integrationsState),
    ui: { editor: { isFocused: false } },
    ticket: fromJS({ _internal: { isPartialUpdating: false } }),
}

const ticket = {
    ...emailTicket.toJS(),
    meta: {
        rule_suggestion: {
            slug: emptyRuleRecipeFixture.slug,
            actions: [
                { name: 'addTags', args: { tags: 'auto-close' } },
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
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    it('should display RuleSuggestion', () => {
        const { container } = render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should not display RuleSuggestion (no addon)', () => {
        const noAddonStore = {
            ...store,
            currentAccount: fromJS({ ...account }),
        }
        const { container } = render(
            <Provider store={mockStore(noAddonStore)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should send internal note because no text in suggestion', () => {
        const ticket = {
            ...emailTicket.toJS(),
            meta: {
                rule_suggestion: {
                    slug: emptyRuleRecipeFixture.slug,
                    actions: [
                        { name: 'addTags', args: { tags: 'auto-close' } },
                    ],
                },
            },
        }

        render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion ticket={ticket} />
            </Provider>,
        )

        fireEvent.click(screen.getByText(/Apply/))
        expect((sendTicketMessage as jest.Mock).mock.calls).toMatchSnapshot()

        const placeholder = screen.queryByText('(No reply will be sent)')
        expect(placeholder).not.toBeNull()
    })

    it('should send message', () => {
        render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )

        const button = screen.getByRole('button', { name: /Apply/ })
        fireEvent.click(button)
        expect((sendTicketMessage as jest.Mock).mock.calls).toMatchSnapshot()
        expect(button).toBeAriaDisabled()
    })

    it('should display in preview for large suggestion body', async () => {
        const bodyHeight = 150
        ;(useMeasure as jest.Mock).mockImplementation(() => [
            undefined,
            bodyHeight,
        ])

        const { container } = render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
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
                role: { name: UserRole.LiteAgent },
            }),
        }
        render(
            <Provider store={mockStore(liteAgentStore)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: /Install/ }),
        ).toBeAriaDisabled()
    })

    it('should display activate if rule already installed', () => {
        const storeWithRule = {
            ...store,
            entities: {
                ...store.entities,
                rules: [
                    {
                        ...emptyManagedRule,
                        settings: { slug: emptyRuleRecipeFixture.slug },
                        deactivated_datetime: '01/01/2022',
                    },
                ],
            },
        }

        render(
            <Provider store={mockStore(storeWithRule)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )
        const activate = screen.getByText(/Activate/)
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
                        settings: { slug: emptyRuleRecipeFixture.slug },
                    },
                ],
            },
        }

        render(
            <Provider store={mockStore(storeWithRule)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )
        const install = screen.queryByText('Install')
        const activate = screen.queryByText('Activate')
        expect(install).toBeNull()
        expect(activate).toBeNull()
    })

    it('should return correct value for getRuleSuggestionContent', () => {
        expect(getRuleSuggestionContent(ticket)).toMatchSnapshot()
        expect(isSuggestionEmpty(getRuleSuggestionContent(ticket))).toBe(false)
        const noAction = {
            ...emailTicket.toJS(),
            meta: { rule_suggestion: { actions: [] } },
        }
        expect(getRuleSuggestionContent(noAction)).toMatchSnapshot()
        expect(isSuggestionEmpty(getRuleSuggestionContent(noAction))).toBe(true)
    })

    it('should display the CTAs for no addon and admin role', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.TicketDemoSuggestion]: 10,
        })

        render(
            <Provider store={mockStore(store)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )
        const bookDemo = screen.queryByText('Book Demo')
        const dismiss = screen.queryByText('Dismiss')
        expect(bookDemo).toBeDefined()
        expect(dismiss).toBeDefined()

        const install = screen.queryByText('Install')
        const activate = screen.queryByText('Activate')
        expect(install).toBeNull()
        expect(activate).toBeNull()
    })

    it('should display the CTAs for no addon and agent role', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.TicketDemoSuggestion]: 10,
        })

        const liteAgentStore = {
            ...store,
            currentUser: fromJS({
                ...agents[0],
                role: { name: UserRole.LiteAgent },
            }),
        }
        render(
            <Provider store={mockStore(liteAgentStore)}>
                <RuleSuggestion {...minProps} />
            </Provider>,
        )

        const notifyAdmin = screen.queryByText('Notify Admin')
        const dismiss = screen.queryByText('Dismiss')
        expect(notifyAdmin).toBeDefined()
        expect(dismiss).toBeDefined()
    })
})
