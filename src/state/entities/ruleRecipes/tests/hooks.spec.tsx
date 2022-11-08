import React, {ReactNode} from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import {useRuleRecipes} from '../hooks'

jest.mock('models/ruleRecipe/resources')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore({
    entities: {
        ruleRecipes: {
            [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture,
        },
    },
})

describe('useRuleRecipes', () => {
    it('should return the recipes', () => {
        const wrapper = ({children}: {children?: ReactNode}) => (
            <Provider store={store}>{children}</Provider>
        )
        const {result} = renderHook(() => useRuleRecipes(), {wrapper})
        const [loading, recipes] = result.current
        expect(loading).toBeFalsy()
        expect(recipes).toMatchSnapshot()
        expect(fetchRuleRecipes).toHaveBeenCalledTimes(0)
    })

    it('should load the recipes', () => {
        const wrapper = ({children}: {children?: ReactNode}) => (
            <Provider store={mockStore({entities: {}})}>{children}</Provider>
        )
        const {result} = renderHook(() => useRuleRecipes(), {wrapper})
        const [loading, recipes] = result.current
        expect(loading).toBeTruthy()
        expect(recipes).toMatchSnapshot()
        expect(fetchRuleRecipes).toHaveBeenCalledTimes(1)
    })
})
