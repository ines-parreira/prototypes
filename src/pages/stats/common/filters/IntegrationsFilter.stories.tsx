import {Meta, StoryFn} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {integrationsState} from 'fixtures/integrations'
import {Integration} from 'models/integration/types'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'

import {IntegrationsFilter} from 'pages/stats/common/filters/IntegrationsFilter'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Common/Filters/IntegrationsFilter',
    component: IntegrationsFilter,
}

const Template: StoryFn<ComponentProps<typeof IntegrationsFilter>> = (
    props: ComponentProps<typeof IntegrationsFilter>
) => {
    return (
        <Provider store={configureMockStore([thunk])(defaultState)}>
            <IntegrationsFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    value: withDefaultLogicalOperator(
        integrationsState.integrations.map((integration) => integration.id)
    ),
    integrations: integrationsState.integrations as Integration[],
}

export default storyConfig
