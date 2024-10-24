import {render, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {macros} from 'fixtures/macro'
import client from 'models/api/resources'
import MacroSelect from 'pages/common/components/ast/widget/MacroSelect'
import {RootState} from 'state/types'

const mockStore = configureMockStore([thunk])

const minProps = {
    value: '1',
    onChange: jest.fn(),
}

const spy = jest.spyOn(client, 'get')

describe('<MacroSelect/>', () => {
    let mockServer: MockAdapter
    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    const defaultStore: Partial<RootState> = {
        macros: fromJS({
            items: macros,
        }),
    }

    it('should render', async () => {
        mockServer.onGet('/api/macros/').reply(200, {
            data: macros,
            meta: {
                prev_cursor: null,
                next_cursor: null,
            },
        })
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroSelect {...minProps} />
            </Provider>
        )
        await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render when no macros available', async () => {
        const macroWithNullActions = {...macros[0], actions: null}
        mockServer.onGet('/api/macros/').reply(200, {
            data: [macroWithNullActions],
            meta: {
                prev_cursor: null,
                next_cursor: null,
            },
        })
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroSelect {...minProps} />
            </Provider>
        )
        await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
        expect(container.firstChild).toMatchSnapshot()
    })
})
