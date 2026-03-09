import type { ComponentProps } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import CampaignsFilter from 'domains/reporting/pages/common/filters/CampaignsFilter'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { campaignsResponseData } from 'fixtures/campaign'
import { campaignKeys } from 'models/convert/campaign/queries'
import type { RootState } from 'state/types'

const defaultState = {
    stats: {
        filters: initialState.filters,
        [FilterKey.Integrations]: withDefaultLogicalOperator([]),
    },
    integrations: fromJS({
        integrations: fromJS([
            {
                deleted_datetime: null,
                meta: {
                    app_id: '321',
                    address: 'help-center|dj9wixfc',
                    shop_integration_id: 1,
                },
                http: null,
                deactivated_datetime: null,
                application_id: '123456b78ef9b1011121314d',
                name: 'Gorgias Chat Integration',
                uri: '/something/integrations/1147/',
                decoration: null,
                locked_datetime: null,
                created_datetime: '2024-05-17T12:53:45.181326+00:00',
                type: 'gorgias_chat',
                id: 321,
                description: null,
                updated_datetime: '2024-05-17T12:53:45.181331+00:00',
                managed: false,
            },
            {
                deleted_datetime: null,
                meta: {
                    app_id: '322',
                    address: 'help-center|dj9wixfc',
                    shop_integration_id: 2,
                },
                http: null,
                deactivated_datetime: null,
                application_id: '987654b78ef9b1011121314d',
                name: 'Gorgias Chat Integration 2',
                uri: '/something/integrations/1148/',
                decoration: null,
                locked_datetime: null,
                created_datetime: '2024-05-17T12:53:45.181326+00:00',
                type: 'gorgias_chat',
                id: 322,
                description: null,
                updated_datetime: '2024-05-17T12:53:45.181331+00:00',
                managed: false,
            },
            {
                deleted_datetime: null,
                meta: {
                    app_id: '323',
                    address: 'help-center|dj9wixfc',
                    shop_integration_id: 3,
                },
                http: null,
                deactivated_datetime: null,
                application_id: '111111b78ef9b1011121314d',
                name: 'Gorgias Chat Integration 3',
                uri: '/something/integrations/1149/',
                decoration: null,
                locked_datetime: null,
                created_datetime: '2024-05-17T12:53:45.181326+00:00',
                type: 'gorgias_chat',
                id: 323,
                description: null,
                updated_datetime: '2024-05-17T12:53:45.181331+00:00',
                managed: false,
            },
        ]),
    }),
} as unknown as RootState

const storyConfig: Meta = {
    title: 'Stats/Filters/CampaignsFilter',
    component: CampaignsFilter,
}

const Template: StoryFn<ComponentProps<typeof CampaignsFilter>> = (props) => {
    appQueryClient.setQueryData(
        campaignKeys.list({
            channelConnectionExternalIds: ['321'],
            // @ts-ignore-next-line
            deleted: true,
        }),
        {
            data: campaignsResponseData,
        },
    )

    return (
        <QueryClientProvider client={appQueryClient}>
            <MemoryRouter initialEntries={['/path/321']}>
                <Route path="/path/:id">
                    <Provider store={configureMockStore([thunk])(defaultState)}>
                        <CampaignsFilter {...props} />
                    </Provider>
                </Route>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

export const Default = Template.bind({})
Default.args = {
    value: withDefaultLogicalOperator([]),
}

export default storyConfig
