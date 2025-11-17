import type { ReactNode } from 'react'
import React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { emptyRule } from 'fixtures/rule'
import { fetchRules } from 'models/rule/resources'

import { useRules } from '../hooks'

jest.mock('models/rule/resources')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore({
    entities: {
        rules: { [emptyRule.id]: emptyRule },
    },
})

describe('useRules', () => {
    it('should return the rules', () => {
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        )
        const { result } = renderHook(() => useRules(), { wrapper })
        const rules = result.current
        expect(rules).toMatchSnapshot()
        expect(fetchRules).toHaveBeenCalledTimes(0)
    })

    it('should load the rules', () => {
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <Provider store={mockStore({ entities: {} })}>{children}</Provider>
        )
        const { result } = renderHook(() => useRules(), { wrapper })
        const rules = result.current
        expect(rules).toMatchSnapshot()
        expect(fetchRules).toHaveBeenCalledTimes(1)
    })
})
