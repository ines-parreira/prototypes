import React, {ReactNode} from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {emptyRule} from 'fixtures/rule'
import {fetchRules} from 'models/rule/resources'
import {useRules} from '../hooks'

jest.mock('models/rule/resources')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore({
    entities: {
        rules: {[emptyRule.id]: emptyRule},
    },
})

describe('useRules', () => {
    it('should return the rules', () => {
        const wrapper = ({children}: {children?: ReactNode}) => (
            <Provider store={store}>{children}</Provider>
        )
        const {result} = renderHook(() => useRules(), {wrapper})
        const rules = result.current
        expect(rules).toMatchSnapshot()
        expect(fetchRules).toHaveBeenCalledTimes(0)
    })

    it('should load the rules', () => {
        const wrapper = ({children}: {children?: ReactNode}) => (
            <Provider store={mockStore({entities: {}})}>{children}</Provider>
        )
        const {result} = renderHook(() => useRules(), {wrapper})
        const rules = result.current
        expect(rules).toMatchSnapshot()
        expect(fetchRules).toHaveBeenCalledTimes(1)
    })
})
