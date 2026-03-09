import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { withDefaultCustomFieldAndLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import CustomFieldsFilter from 'domains/reporting/pages/common/filters/CustomFieldsFilter'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { customFieldsMockResponse } from 'fixtures/customField'
import type { RootState } from 'state/types'

const defaultState = {
    stats: initialState,
} as RootState

const storyConfig: Meta = {
    title: 'Stats/Filters/CustomFieldsFilter',
    component: CustomFieldsFilter,
}

const Template: StoryFn<ComponentProps<typeof CustomFieldsFilter>> = (
    props,
) => {
    appQueryClient.setQueryData(
        queryKeys.customFields.listCustomFields(activeParams),
        {
            data: customFieldsMockResponse,
        },
    )
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
