import {Meta} from '@storybook/react'
import {fromJS, Map} from 'immutable'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {ticket} from 'fixtures/ticket'
import {HTTP_INTEGRATION_TYPE} from 'constants/integration'
import Infobar from 'pages/common/components/infobar/Infobar/Infobar'
import {ThemeProvider, useTheme} from 'theme'

const defaultState = {
    currentUser: Map({
        id: Math.random() * 1000,
    }),
    integrations: fromJS({
        integrations: [{type: HTTP_INTEGRATION_TYPE}],
    }),
    ticket: fromJS(ticket),
}

const storyConfig: Meta = {
    title: 'Tickets/InfoBar',
    component: Infobar,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
    args: {
        customer: fromJS({
            id: 2,
        }),
        identifier: '1',
        sources: fromJS({
            ticket: {
                customer: {
                    id: 2,
                },
            },
            customer: {
                id: 2,
                data: {name: 'Marie Curie'},
            },
        }),
        widgets: fromJS({
            currentContext: 'customer',
            _internal: {
                isEditing: false,
                hasFetchedWidgets: true,
            },
        }),
    },
    decorators: [
        (Component) => (
            <ThemeProvider>
                <Provider store={configureMockStore([thunk])(defaultState)}>
                    <MemoryRouter>
                        <div>
                            <Component />
                        </div>
                    </MemoryRouter>
                </Provider>
            </ThemeProvider>
        ),
    ],
}

export const Default = {
    args: {
        primary: true,
    },
}
export const WithDefaultAppTheme: Meta = {
    ...Default,
    decorators: [
        (Component) => {
            const theme = useTheme()
            return (
                <div className={theme}>
                    <Component />
                </div>
            )
        },
        ...(storyConfig.decorators ?? []),
    ],
}
export default storyConfig
