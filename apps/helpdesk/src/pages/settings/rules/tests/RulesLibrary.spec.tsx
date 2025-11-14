import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Router, useLocation } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'

import {
    emptyManagedRule,
    emptyRule as ruleFixture,
} from '../../../../fixtures/rule'
import { user } from '../../../../fixtures/users'
import { fetchRules } from '../../../../models/rule/resources'
import { fetchRuleRecipes } from '../../../../models/ruleRecipe/resources'
import { RulesState } from '../../../../state/entities/rules/types'
import { RootState, StoreDispatch } from '../../../../state/types'
import { RulesLibraryContainer } from '../RulesLibrary'

jest.mock('../../../../models/rule/resources')
jest.mock('../../../../models/ruleRecipe/resources')
jest.mock('../../../../state/entities/ruleRecipes/actions')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

const useLocationMock = useLocation as jest.Mock
useLocationMock.mockReturnValue({
    search: '',
})

const createRuleFixtures = (length: number) => {
    return Array.from({ length }, (_, i) => ({
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
        currentUser: fromJS(user),
    } as any
    return defaultState
}

describe('<RulesLibrary/>', () => {
    const fetchRulesMock = fetchRules as jest.MockedFunction<typeof fetchRules>
    const fetchRuleRecipesMock = fetchRuleRecipes as jest.MockedFunction<
        typeof fetchRuleRecipes
    >

    it('should render the rules library view', () => {
        const { container } = render(
            <MemoryRouter>
                <Provider store={mockStore(populateStore(5))}>
                    <RulesLibraryContainer />
                </Provider>
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the rule library view', () => {
        useLocationMock.mockReturnValue({
            hash: '#rule-library',
        })

        const { container } = render(
            <MemoryRouter>
                <Provider store={mockStore(populateStore(5))}>
                    <RulesLibraryContainer />
                </Provider>
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render create custom rule footer', async () => {
        useLocationMock.mockReturnValue({
            hash: '#rule-library',
        })

        render(
            <MemoryRouter>
                <Provider store={mockStore(populateStore(5))}>
                    <RulesLibraryContainer />
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(screen.getByText(/Create Custom Rule/i)).toBeDefined()
        })
    })

    it('should fetch rules', () => {
        render(
            <MemoryRouter>
                <Provider store={mockStore(populateStore(1))}>
                    <RulesLibraryContainer />
                </Provider>
            </MemoryRouter>,
        )
        expect(fetchRulesMock).toHaveBeenCalled()
    })

    it('should fetch rule recipes', () => {
        render(
            <MemoryRouter>
                <Provider store={mockStore(populateStore(1))}>
                    <RulesLibraryContainer />
                </Provider>
            </MemoryRouter>,
        )
        expect(fetchRuleRecipesMock).toHaveBeenCalled()
    })

    it('it should redirect to rule page if managed rule installed', () => {
        useLocationMock.mockReturnValue({
            search: `?${emptyManagedRule.settings.slug}`,
        })
        const rules = {
            [emptyManagedRule.id]: emptyManagedRule,
        }

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
                    <RulesLibraryContainer />
                </Provider>
            </Router>,
        )
        expect(historySpy).toBeCalledWith(
            `/app/settings/rules/${emptyManagedRule.id}`,
        )
    })
})
