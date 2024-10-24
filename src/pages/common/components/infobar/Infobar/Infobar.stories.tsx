import {Meta} from '@storybook/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS, Map} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {appQueryClient} from 'api/queryClient'
import {HTTP_INTEGRATION_TYPE} from 'constants/integration'
import {ticket} from 'fixtures/ticket'
import Infobar from 'pages/common/components/infobar/Infobar/Infobar'
import {ThemeProvider, useTheme} from 'theme'
import {initLaunchDarkly} from 'utils/launchDarkly'

initLaunchDarkly(null as any, null as any)

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
    title: 'Infobar/Infobar',
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
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={configureMockStore([thunk])(defaultState)}>
                        <MemoryRouter>
                            <div>
                                <Component />
                            </div>
                        </MemoryRouter>
                    </Provider>
                </QueryClientProvider>
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
    ],
}
export default storyConfig
