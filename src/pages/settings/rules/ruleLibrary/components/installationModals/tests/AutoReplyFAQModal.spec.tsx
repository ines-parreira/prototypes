import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {emptyManagedRule} from 'fixtures/rule'
import {RootState, StoreDispatch} from 'state/types'
import {IntegrationType} from 'models/integration/constants'
import {AutoReplyFAQModal} from '../AutoReplyFAQModal'

describe('<AutoReplyFAQModal/>', () => {
    const minProps: ComponentProps<typeof AutoReplyFAQModal> = {
        rule: emptyManagedRule,
        triggeredCount: 10,
        isBehindPaywall: false,
        renderTags: () => <>tags</>,
        viewCreationCheckbox: () => <>checkbox</>,
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
                <AutoReplyFAQModal {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the autoclose spam body when automation add-on is subscribed', () => {
        const {container} = render(
            <Provider store={store}>
                <AutoReplyFAQModal {...minProps} isBehindPaywall={true} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
