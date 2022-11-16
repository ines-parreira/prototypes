import React from 'react'
import {RouteComponentProps, Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {createMemoryHistory} from 'history'

import {RulesState} from '../../../../state/entities/rules/types'
import {RULE_MAX_NUMBER} from '../../../../state/entities/rules/selectors'
import {fetchRules} from '../../../../models/rule/resources'
import {fetchRuleRecipes} from '../../../../models/ruleRecipe/resources'
import {
    emptyRule as ruleFixture,
    emptyManagedRule,
} from '../../../../fixtures/rule'
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
            helpCenter: {
                helpCenters: {},
            },
        },
    } as any
    return defaultState
}

const minProps = {
    location: {
        hash: '#',
    },
} as unknown as RouteComponentProps

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
                <RulesViewContainer {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the rule library view', () => {
        const props = {
            location: {
                hash: '#rule-library',
            },
        } as unknown as RouteComponentProps
        const {container} = render(
            <Provider store={mockStore(populateStore(5))}>
                <RulesViewContainer {...props} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch rules', () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesViewContainer {...minProps} />
            </Provider>
        )
        expect(fetchRulesMock).toHaveBeenCalled()
    })

    it('should fetch rule recipes', () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesViewContainer {...minProps} />
            </Provider>
        )
        expect(fetchRuleRecipesMock).toHaveBeenCalled()
    })

    it('should render a warning when reaching the rule limit', () => {
        const {getByText} = render(
            <Provider store={mockStore(populateStore(65))}>
                <RulesViewContainer {...minProps} />
            </Provider>
        )
        expect(getByText(/65 out of 70/)).not.toBe(null)
    })

    it('should render an error when reached the rule limit', () => {
        const {getByText} = render(
            <Provider store={mockStore(populateStore(RULE_MAX_NUMBER))}>
                <RulesViewContainer {...minProps} />
            </Provider>
        )
        expect(getByText(/you have reached the 70 rule limit/i)).not.toBe(null)
    })

    it('it should redirect to rule page if managed rule installed', () => {
        const rules = {
            [emptyManagedRule.id]: emptyManagedRule,
        }
        const props = {
            location: {
                hash: `#rule-library?${emptyManagedRule.settings.slug}`,
            },
        } as unknown as RouteComponentProps

        const store: RootState = {
            entities: {
                rules: rules,
                helpCenter: {
                    helpCenters: {},
                },
            },
        } as any

        const history = createMemoryHistory()
        const historySpy = jest.spyOn(history, 'replace')
        render(
            <Router history={history}>
                <Provider store={mockStore(store)}>
                    <RulesViewContainer {...props} />
                </Provider>
            </Router>
        )
        expect(historySpy).toBeCalledWith(
            `/app/settings/rules/${emptyManagedRule.id}`
        )
    })
})
