import {renderHook} from '@testing-library/react-hooks'
import React, {ReactNode} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'

import {useRuleRecipes} from '../hooks'

jest.mock('models/ruleRecipe/resources')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore({
    entities: {
        ruleRecipes: {[emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture},
    },
})

describe('useRuleRecipes', () => {
    it('should return the recipes', () => {
        const wrapper = ({children}: {children?: ReactNode}) => (
            <Provider store={store}>{children}</Provider>
        )
        const {result} = renderHook(() => useRuleRecipes(), {wrapper})
        const recipes = result.current
        expect(recipes).toMatchSnapshot()
        expect(fetchRuleRecipes).toHaveBeenCalledTimes(0)
    })

    it('should load the recipes', () => {
        const wrapper = ({children}: {children?: ReactNode}) => (
            <Provider store={mockStore({entities: {}})}>{children}</Provider>
        )
        const {result} = renderHook(() => useRuleRecipes(), {wrapper})
        const recipes = result.current
        expect(recipes).toMatchSnapshot()
        expect(fetchRuleRecipes).toHaveBeenCalledTimes(1)
    })
})
