import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {render, screen, waitFor} from '@testing-library/react'

import {RulesState} from '../../../../state/entities/rules/types'
import {RULE_MAX_NUMBER} from '../../../../state/entities/rules/selectors'
import {fetchRules} from '../../../../models/rule/resources'
import {emptyRule as ruleFixture} from '../../../../fixtures/rule'
import {RootState, StoreDispatch} from '../../../../state/types'

import {RulesList} from '../RulesList'

jest.mock('../../../../models/rule/resources')
jest.mock('../../../../state/entities/rules/actions')
jest.mock('../accountRules/RulesList', () => () => {
    return <div data-testid="rules-list"></div>
})
jest.mock('../components/CreateRuleFooter', () => () => {
    return <div data-testid="create-rule-footer"></div>
})

const createRuleFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        ...ruleFixture,
        id: i + 1,
    })).reduce((acc, value) => {
        acc[value.id.toString()] = value
        return acc
    }, {} as RulesState)
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const populateStore = (length: number): RootState => {
    const rules = createRuleFixtures(length)
    const defaultState: RootState = {
        entities: {
            rules: rules,
            helpCenter: {
                helpCenters: {},
            },
        },
    } as any
    return defaultState
}

describe('<RulesList/>', () => {
    const fetchRulesMock = fetchRules as jest.MockedFunction<typeof fetchRules>

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render create rule footer', async () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesList />
            </Provider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('create-rule-footer')).toBeDefined()
        })
    })

    it('should not render create rule footer', async () => {
        render(
            <Provider store={mockStore(populateStore(6))}>
                <RulesList />
            </Provider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('rules-list')).toBeDefined()
            expect(screen.queryByTestId('create-rule-footer')).toBe(null)
        })
    })

    it('should render the rules list', () => {
        const {container} = render(
            <Provider store={mockStore(populateStore(5))}>
                <RulesList />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch rules', () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesList />
            </Provider>
        )
        expect(fetchRulesMock).toHaveBeenCalled()
    })

    it('should render a warning when reaching the rule limit', () => {
        const {getByText} = render(
            <Provider store={mockStore(populateStore(65))}>
                <RulesList />
            </Provider>
        )
        expect(getByText(/65 out of 70/)).not.toBe(null)
    })

    it('should render an error when reached the rule limit', () => {
        const {getByText} = render(
            <Provider store={mockStore(populateStore(RULE_MAX_NUMBER))}>
                <RulesList />
            </Provider>
        )
        expect(getByText(/you have reached the 70 rule limit/i)).not.toBe(null)
    })
})
