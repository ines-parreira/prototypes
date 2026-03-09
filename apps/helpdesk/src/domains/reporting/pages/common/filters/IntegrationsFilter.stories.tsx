import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { IntegrationsFilter } from 'domains/reporting/pages/common/filters/IntegrationsFilter'
import { integrationsState } from 'fixtures/integrations'
import type { Integration } from 'models/integration/types'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Stats/Filters/IntegrationsFilter',
    component: IntegrationsFilter,
}

const Template: StoryFn<ComponentProps<typeof IntegrationsFilter>> = (
    props: ComponentProps<typeof IntegrationsFilter>,
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
        integrationsState.integrations.map((integration) => integration.id),
    ),
    integrations: integrationsState.integrations as Integration[],
}

export default storyConfig
