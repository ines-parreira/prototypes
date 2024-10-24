import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    duplicatedHiddenFacebookMessage,
    facebookMessageNoMeta,
} from 'models/ticket/tests/mocks'

import SourceDetailsHeader from '../SourceDetailsHeader'

/* DatetimeLabel uses Math.random.
 * Mock it to always return the same data.
 */
const mockMath = Object.create(global.Math) as typeof global.Math
mockMath.random = () => 1
global.Math = mockMath

const mockDate = new Date('2021-02-26T13:00:00.000Z')
global.Date.now = jest.fn(() => mockDate) as unknown as typeof Date.now

const mockStore = configureMockStore([thunk])
const store = mockStore({
    billing: fromJS({products: []}),
})

describe('<SourceDetailsHeader/>', () => {
    const minProps: ComponentProps<typeof SourceDetailsHeader> = {
        message: facebookMessageNoMeta,
        timezone: 'UTC',
        isMessageDeleted: false,
    }
    it(`should render a DatetimeLabel and the SourceActionsHeader because the message is not duplicated
            and is not deleted`, () => {
        const {container} = render(
            <Provider store={store}>
                <SourceDetailsHeader {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it(`should render a DatetimeLabel because the message is not duplicated and should not render the
            SourceActionsHeader because the message is deleted`, () => {
        const {container} = render(
            <Provider store={store}>
                <SourceDetailsHeader {...minProps} isMessageDeleted={true} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it(`should render a "go to ticket" link instead of the date because the message is duplicated and should render the
            SourceActionsHeader because the message is not deleted`, () => {
        const {getByText} = render(
            <Provider store={store}>
                <SourceDetailsHeader
                    {...minProps}
                    message={duplicatedHiddenFacebookMessage}
                />
            </Provider>
        )
        expect(getByText(/go to/i)).toBeInTheDocument()
        expect(getByText('ticket').getAttribute('href')).toEqual(
            duplicatedHiddenFacebookMessage.meta!.private_reply!.original_ticket_id!.toString()
        )
    })

    it(`should render a "go to ticket" link instead of the date because the message is duplicated and should not
            render the SourceActionsHeader because the message is deleted`, () => {
        const {getByText} = render(
            <Provider store={store}>
                <SourceDetailsHeader
                    {...minProps}
                    message={duplicatedHiddenFacebookMessage}
                    isMessageDeleted={true}
                />
            </Provider>
        )
        expect(getByText(/go to/i)).toBeInTheDocument()
        expect(getByText('ticket').getAttribute('href')).toEqual(
            duplicatedHiddenFacebookMessage.meta!.private_reply!.original_ticket_id!.toString()
        )
    })
})
