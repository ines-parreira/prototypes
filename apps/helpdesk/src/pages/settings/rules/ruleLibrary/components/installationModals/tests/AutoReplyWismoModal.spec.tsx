import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { noop } from '@gorgias/toolkit'

import { emptyManagedRule } from 'fixtures/rule'
import { IntegrationType } from 'models/integration/constants'
import type { RootState, StoreDispatch } from 'state/types'

import { AutoReplyWismoModal } from '../AutoReplyWismoModal'

describe('<AutoReplyWismoModal/>', () => {
    const minProps: ComponentProps<typeof AutoReplyWismoModal> = {
        rule: emptyManagedRule,
        recipeSlug: 'auto-reply-wismo',
        triggeredCount: 10,
        viewCreationCheckbox: () => <></>,
        handleInstallationError: noop,
        handleDefaultSettings: noop,
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        integrations: fromJS({
            integrations: [{ type: IntegrationType.Shopify }],
        }),
        entities: {
            helpCenter: { articles: {}, categories: {}, helpCenters: {} },
        } as unknown as RootState['entities'],
    })
    it('should render the autoclose spam body when AI Agent is subscribed', () => {
        const { container } = render(
            <Provider store={store}>
                <AutoReplyWismoModal {...minProps} />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render the autoclose spam body when AI Agent is not subscribed', () => {
        const { container } = render(
            <Provider store={store}>
                <AutoReplyWismoModal {...minProps} />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
