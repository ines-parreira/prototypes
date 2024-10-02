import {QueryClientProvider} from '@tanstack/react-query'
import React, {ComponentProps} from 'react'
import {Meta, StoryFn} from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {appQueryClient} from 'api/queryClient'
import CustomFieldsFilter from 'pages/stats/common/filters/CustomFieldsFilter'
import {customFieldDefinitionKeys} from 'models/customField/queries'
import {activeParams} from 'pages/stats/CustomFieldSelect'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {withDefaultCustomFieldAndLogicalOperator} from 'models/reporting/queryFactories/utils'
import {customFieldsMockResponse} from 'fixtures/customField'

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
