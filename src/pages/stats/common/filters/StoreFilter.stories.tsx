import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Meta, StoryFn} from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {ThemeProvider} from 'theme'
import StoreFilter from 'pages/stats/common/filters/StoreFilter'
import {getIntegration} from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import {IntegrationType} from 'models/integration/constants'
import {RootState} from 'state/types'
import {initialState as billingInitialState} from 'state/billing/reducers'
import * as billingFixtures from 'fixtures/billing'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {getStoreIntegrations} from 'state/integrations/selectors'

const storyConfig: Meta = {
    title: 'Common/Filters/StoreFilter',
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
