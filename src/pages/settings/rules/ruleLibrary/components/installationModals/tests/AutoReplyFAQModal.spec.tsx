import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {emptyManagedRule} from 'fixtures/rule'
import {RootState, StoreDispatch} from 'state/types'
import {IntegrationType} from 'models/integration/constants'
import {HelpCenter} from 'models/helpCenter/types'
import {AutoReplyFAQModal} from '../AutoReplyFAQModal'
import {InstallationError} from '../../../constants'

describe('<AutoReplyFAQModal/>', () => {
    const minProps: ComponentProps<typeof AutoReplyFAQModal> = {
        rule: emptyManagedRule,
        triggeredCount: 10,
        isBehindPaywall: false,
        renderTags: () => <>tags</>,
        viewCreationCheckbox: () => <>checkbox</>,
        handleInstallationError: jest.fn(),
        handleDefaultSettings: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const createStoreWithHelpCenter = (
        helpCenters: Record<string, HelpCenter>
    ) => {
        const store = mockStore({
            integrations: fromJS({
                integrations: fromJS([{type: IntegrationType.Shopify}]),
            }),
            entities: {
                helpCenter: {
                    articles: {articlesById: {}},
                    categories: {categoriesById: {}},
                    helpCenters: {helpCentersById: helpCenters},
                },
            } as unknown as RootState['entities'],
        })
        return store
    }
    it('should render the autoclose spam body when automation add-on is subscribed', () => {
        const store = createStoreWithHelpCenter({'1': {id: 1} as HelpCenter})
        const {container} = render(
            <Provider store={store}>
                <AutoReplyFAQModal {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
        expect(minProps.handleDefaultSettings).toHaveBeenNthCalledWith(1, {
            help_center_id: 1,
        })
    })
    it('should render the autoclose spam body when automation add-on is subscribed', () => {
        const store = createStoreWithHelpCenter({'1': {} as HelpCenter})
        const {container} = render(
            <Provider store={store}>
                <AutoReplyFAQModal {...minProps} isBehindPaywall={true} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should send an error if there is no helpcenter', () => {
        const store = createStoreWithHelpCenter({})
        render(
            <Provider store={store}>
                <AutoReplyFAQModal {...minProps} isBehindPaywall={true} />
            </Provider>
        )
        expect(minProps.handleInstallationError).toHaveBeenCalledWith(
            InstallationError.NoHelpCenter
        )
    })
})
