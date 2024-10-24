import {render} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {emptyRule as ruleFixture} from 'fixtures/rule'
import {user} from 'fixtures/users'
import {RootState, StoreDispatch} from 'state/types'

import {RuleFormEditor} from '../RuleFormEditor'

describe('<RuleFormEditor />', () => {
    const minProps: ComponentProps<typeof RuleFormEditor> = {
        rule: ruleFixture,
    }

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {},
        currentUser: fromJS(user),
    } as RootState)

    const history = createMemoryHistory()

    it('should render editor for rule', () => {
        const {baseElement} = render(
            <Router history={history}>
                <Provider store={store}>
                    <RuleFormEditor {...minProps} />
                </Provider>
            </Router>
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('should render editor for creating rule', () => {
        const props = {
            ...minProps,
            rule: undefined,
        }

        const {baseElement} = render(
            <Router history={history}>
                <Provider store={store}>
                    <RuleFormEditor {...props} />
                </Provider>
            </Router>
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })
})
