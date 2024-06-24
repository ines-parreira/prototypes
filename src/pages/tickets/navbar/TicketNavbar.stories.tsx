import {Meta} from '@storybook/react'
import {fromJS, Map} from 'immutable'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {NotificationsProvider} from 'common/notifications'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {newViews} from 'models/view/mocks'
import {TicketNavbarContainer} from 'pages/tickets/navbar/TicketNavbar'
import {SplitTicketViewProvider} from 'split-ticket-view-toggle'
import {initialState as currentAccountInitialState} from 'state/currentAccount/reducers'
import {AccountSettingType} from 'state/currentAccount/types'

const currentUser = Map({
    id: Math.random() * 1000,
})

const defaultState = {
    currentUser,
    chats: fromJS({}),
    entities: fromJS({}),
    products: fromJS({}),
    billing: fromJS(billingState),
}

const settings = [
    ...account.settings,
    {
        type: AccountSettingType.ViewsOrdering,
        id: 1,
        data: {
            views_top: {
                [newViews[2].id]: {
                    display_order: 1,
                },
                [newViews[0].id]: {
                    display_order: 2,
                },
            },
            views_bottom: {
                [newViews[3].id]: {
                    display_order: 2,
                },
                [newViews[1].id]: {
                    display_order: 1,
                },
            },
        },
    },
]

const storyConfig: Meta = {
    title: 'Navigation/TicketNavbar',
    component: TicketNavbarContainer,
    parameters: {
        chromatic: {
            diffThreshold: 0.045,
            disableSnapshot: false,
        },
    },
    decorators: [
        (Component) => (
            <Provider store={configureMockStore([thunk])(defaultState)}>
                <SplitTicketViewProvider>
                    <DndProvider backend={HTML5Backend}>
                        <MemoryRouter>
                            <NotificationsProvider>
                                <div>
                                    <Component />
                                </div>
                            </NotificationsProvider>
                        </MemoryRouter>
                    </DndProvider>
                </SplitTicketViewProvider>
            </Provider>
        ),
    ],
    args: {
        currentAccount: currentAccountInitialState
            .mergeDeep(account)
            .set('settings', fromJS(settings)),
        currentUser,
        primary: true,
        privateElements: [],
        sharedElements: [],
        systemTopElements: [
            {
                View: 'view',
                Section: 'section',
                Category: 'category',
            },
        ],
        viewsCount: [],
        viewId: 1,
    },
}

export const Default = {
    args: {
        primary: true,
    },
}

export default storyConfig
