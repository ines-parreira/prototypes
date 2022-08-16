import React from 'react'

import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'

import _noop from 'lodash/noop'

import {render} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'

import MacroReplyActionControls from '../MacroReplyActionControls'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const store = mockStore({} as RootState)

const renderMacroReplyActionControls = ({
    fields = {},
    onChange = _noop,
}: Partial<React.ComponentProps<typeof MacroReplyActionControls>> = {}) =>
    render(
        <Provider store={store}>
            <MacroReplyActionControls fields={fields} onChange={onChange} />
        </Provider>
    )

describe('MacroReplyActionControls', () => {
    it('should render "Current client" placeholder', () => {
        const {container} = renderMacroReplyActionControls()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render Cc but not Bcc', () => {
        const {container} = renderMacroReplyActionControls({
            fields: {cc: 'test@gorgias.com'},
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render Bcc but not Cc', () => {
        const {container} = renderMacroReplyActionControls({
            fields: {bcc: 'test@gorgias.com'},
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render To field', () => {
        const {container} = renderMacroReplyActionControls({
            fields: {
                to: 'test@gorgias.com,test@gorgias.com',
            },
        })

        expect(container.firstChild).toMatchSnapshot()
    })
})
