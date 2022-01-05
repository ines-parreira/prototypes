import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'

import {RulesState} from '../../../../state/entities/rules/types'
import {RULE_MAX_NUMBER} from '../../../../state/entities/rules/selectors'
import {fetchRules} from '../../../../models/rule/resources'
import {fetchRuleRecipes} from '../../../../models/ruleRecipe/resources'
import {emptyRule as ruleFixture} from '../../../../fixtures/rule'
import {RootState, StoreDispatch} from '../../../../state/types'

import {RulesViewContainer} from '../RulesView'

jest.mock('../../../../models/rule/resources')
jest.mock('../../../../models/ruleRecipe/resources')
jest.mock('../../../../state/entities/rules/actions')
jest.mock('../../../../state/entities/ruleRecipes/actions')
jest.mock('../accountRules/RulesList', () => () => {
    return <div></div>
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
        },
    } as any
    return defaultState
}

describe('<RulesView/>', () => {
    const fetchRulesMock = fetchRules as jest.MockedFunction<typeof fetchRules>
    const fetchRuleRecipesMock = fetchRuleRecipes as jest.MockedFunction<
        typeof fetchRuleRecipes
    >

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the rule views', () => {
        const {container} = render(
            <Provider store={mockStore(populateStore(5))}>
                <RulesViewContainer />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch rules', () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesViewContainer />
            </Provider>
        )
        expect(fetchRulesMock).toHaveBeenCalled()
    })

    it('should fetch rule recipes', () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesViewContainer />
            </Provider>
        )
        expect(fetchRuleRecipesMock).toHaveBeenCalled()
    })

    it('should render a warning when reaching the rule limit', () => {
        const {getByText} = render(
            <Provider store={mockStore(populateStore(65))}>
                <RulesViewContainer />
            </Provider>
        )
        expect(getByText('65 rules of 70')).not.toBe(null)
    })

    it('should render an error when reached the rule limit', () => {
        const {getByText} = render(
            <Provider store={mockStore(populateStore(RULE_MAX_NUMBER))}>
                <RulesViewContainer />
            </Provider>
        )
        expect(getByText(/your account has reached the rule limit/i)).not.toBe(
            null
        )
    })
})
