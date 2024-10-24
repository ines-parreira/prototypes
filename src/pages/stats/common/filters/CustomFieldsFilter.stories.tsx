import {Meta, StoryFn} from '@storybook/react'
import {QueryClientProvider} from '@tanstack/react-query'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {appQueryClient} from 'api/queryClient'
import {customFieldDefinitionKeys} from 'custom-fields/hooks/queries/queries'
import {customFieldsMockResponse} from 'fixtures/customField'
import {withDefaultCustomFieldAndLogicalOperator} from 'models/reporting/queryFactories/utils'
import CustomFieldsFilter from 'pages/stats/common/filters/CustomFieldsFilter'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

const defaultState = {
    stats: initialState,
} as RootState

const storyConfig: Meta = {
    title: 'Common/Filters/CustomFieldsFilter',
    component: CustomFieldsFilter,
}

const Template: StoryFn<ComponentProps<typeof CustomFieldsFilter>> = (
    props
) => {
    appQueryClient.setQueryData(customFieldDefinitionKeys.list(activeParams), {
        data: customFieldsMockResponse,
    })
    return (
        <QueryClientProvider client={appQueryClient}>
            <Provider store={configureMockStore([thunk])(defaultState)}>
                <CustomFieldsFilter {...props} />
            </Provider>
        </QueryClientProvider>
    )
}

export const Default = Template.bind({})
Default.args = {
    filterName: 'custom field',
    customFieldId: 5081,
    value: withDefaultCustomFieldAndLogicalOperator({
        customFieldId: 5081,
    }),
}

export default storyConfig
