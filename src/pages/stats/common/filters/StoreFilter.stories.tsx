import {Meta, StoryFn} from '@storybook/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {ThemeProvider} from 'core/theme'
import * as billingFixtures from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {getIntegration} from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import StoreFilter from 'pages/stats/common/filters/StoreFilter'
import {initialState as billingInitialState} from 'state/billing/reducers'
import {getStoreIntegrations} from 'state/integrations/selectors'
import {RootState} from 'state/types'

const storyConfig: Meta = {
    title: 'Stats/Filters/StoreFilter',
    component: StoreFilter,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const defaultState = {
    integrations: fromJS({
        integrations: [
            getIntegration(1, IntegrationType.Shopify),
            getIntegration(2, IntegrationType.Shopify),
        ],
    }),
    billing: billingInitialState.mergeDeep(billingFixtures.billingState),
} as RootState

const Template: StoryFn<ComponentProps<typeof StoreFilter>> = (
    props: ComponentProps<typeof StoreFilter>
) => {
    return (
        <ThemeProvider>
            <Provider store={configureMockStore()({})}>
                <StoreFilter {...props} />
            </Provider>
        </ThemeProvider>
    )
}

export const Default = Template.bind({})
Default.args = {
    value: withLogicalOperator([1]),
    storeIntegrations: getStoreIntegrations(defaultState),
}

export default storyConfig
