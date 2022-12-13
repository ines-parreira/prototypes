import React from 'react'
import {RouteComponentProps, Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {screen, render, waitFor} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'

import {billingState} from 'fixtures/billing'

import {RulesState} from '../../../../state/entities/rules/types'
import {fetchRules} from '../../../../models/rule/resources'
import {fetchRuleRecipes} from '../../../../models/ruleRecipe/resources'
import {
    emptyRule as ruleFixture,
    emptyManagedRule,
} from '../../../../fixtures/rule'
import {RootState, StoreDispatch} from '../../../../state/types'

import {RulesLibraryContainer} from '../RulesLibrary'

jest.mock('../../../../models/rule/resources')
jest.mock('../../../../models/ruleRecipe/resources')
jest.mock('../../../../state/entities/ruleRecipes/actions')

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
        billing: fromJS(billingState),
    } as any
    return defaultState
}

const minProps = {
    location: {
        hash: '',
    },
} as unknown as RouteComponentProps

describe('<RulesLibrary/>', () => {
    const fetchRulesMock = fetchRules as jest.MockedFunction<typeof fetchRules>
    const fetchRuleRecipesMock = fetchRuleRecipes as jest.MockedFunction<
        typeof fetchRuleRecipes
    >

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the rules library view', () => {
        const {container} = render(
            <Provider store={mockStore(populateStore(5))}>
                <RulesLibraryContainer {...minProps} />
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
                <RulesLibraryContainer {...props} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render create custom rule footer', async () => {
        const props = {
            location: {
                hash: '#rule-library',
            },
        } as unknown as RouteComponentProps

        render(
            <Provider store={mockStore(populateStore(5))}>
                <RulesLibraryContainer {...props} />
            </Provider>
        )

        await waitFor(() => {
            expect(screen.getByText(/Create Custom Rule/i)).toBeDefined()
        })
    })

    it('should fetch rules', () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesLibraryContainer {...minProps} />
            </Provider>
        )
        expect(fetchRulesMock).toHaveBeenCalled()
    })

    it('should fetch rule recipes', () => {
        render(
            <Provider store={mockStore(populateStore(1))}>
                <RulesLibraryContainer {...minProps} />
            </Provider>
        )
        expect(fetchRuleRecipesMock).toHaveBeenCalled()
    })

    it('it should redirect to rule page if managed rule installed', () => {
        const rules = {
            [emptyManagedRule.id]: emptyManagedRule,
        }
        const props = {
            location: {
                search: `?${emptyManagedRule.settings.slug}`,
            },
        } as unknown as RouteComponentProps

        const store: RootState = {
            entities: {
                rules: rules,
                helpCenter: {
                    helpCenters: {},
                },
            },
            billing: fromJS(billingState),
        } as any

        const history = createMemoryHistory()
        const historySpy = jest.spyOn(history, 'replace')
        render(
            <Router history={history}>
                <Provider store={mockStore(store)}>
                    <RulesLibraryContainer {...props} />
                </Provider>
            </Router>
        )
        expect(historySpy).toBeCalledWith(
            `/app/settings/rules/${emptyManagedRule.id}`
        )
    })
})
