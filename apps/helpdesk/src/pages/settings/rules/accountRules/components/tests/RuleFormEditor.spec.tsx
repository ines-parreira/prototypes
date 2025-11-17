import type { ComponentProps } from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { emptyRule as ruleFixture } from 'fixtures/rule'
import { user } from 'fixtures/users'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { RuleFormEditor } from '../RuleFormEditor'

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

    it('should render editor for rule', () => {
        const { baseElement } = renderWithRouter(
            <Provider store={store}>
                <RuleFormEditor {...minProps} />
            </Provider>,
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('should render editor for creating rule', () => {
        const props = {
            ...minProps,
            rule: undefined,
        }

        const { baseElement } = renderWithRouter(
            <Provider store={store}>
                <RuleFormEditor {...props} />
            </Provider>,
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })
})
