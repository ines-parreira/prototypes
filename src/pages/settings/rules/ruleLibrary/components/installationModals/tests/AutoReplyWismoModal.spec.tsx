import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {emptyManagedRule} from 'fixtures/rule'
import {RootState, StoreDispatch} from 'state/types'
import {IntegrationType} from 'models/integration/constants'
import {AutoReplyWismoModal} from '../AutoReplyWismoModal'

describe('<AutoReplyWismoModal/>', () => {
    const minProps: ComponentProps<typeof AutoReplyWismoModal> = {
        rule: emptyManagedRule,
        triggeredCount: 10,
        isBehindPaywall: false,
        renderTags: () => <></>,
        viewCreationCheckbox: () => <></>,
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        integrations: fromJS({
            integrations: fromJS([{type: IntegrationType.Shopify}]),
        }),
    })
    it('should render the autoclose spam body when automation add-on is subscribed', () => {
        const {container} = render(
            <Provider store={store}>
                <AutoReplyWismoModal {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render an alert when there are no shopify integrations', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <AutoReplyWismoModal {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the autoclose spam body when automation add-on is not subscribed', () => {
        const {container} = render(
            <Provider store={store}>
                <AutoReplyWismoModal {...minProps} isBehindPaywall={true} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
