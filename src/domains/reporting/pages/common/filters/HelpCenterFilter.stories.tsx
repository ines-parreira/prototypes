import React, { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import HelpCenterFilter from 'domains/reporting/pages/common/filters/HelpCenterFilter'
import { HelpCenter } from 'models/helpCenter/types'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { RootState } from 'state/types'

const mockStore = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: getHelpCentersResponseFixture.data.reduce(
                    (acc: Record<string, HelpCenter>, hCenter) => {
                        acc[hCenter.id] = hCenter
                        return acc
                    },
                    {},
                ),
            },
        },
    },
} as RootState

const storyConfig: Meta = {
    title: 'Stats/Filters/HelpCenterFilter',
    component: HelpCenterFilter,
}

const Template: StoryFn<ComponentProps<typeof HelpCenterFilter>> = (props) => {
    return (
        <Provider store={configureMockStore([thunk])(mockStore)}>
            <HelpCenterFilter {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})
Default.args = {
    value: withDefaultLogicalOperator([
        getHelpCentersResponseFixture.data[0].id,
    ]),
}

export default storyConfig
