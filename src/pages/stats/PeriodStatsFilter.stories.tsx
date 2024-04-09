import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Meta, StoryFn} from '@storybook/react'
import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import {ThemeProvider} from 'theme'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Stats/PeriodStatsFilter',
    component: PeriodStatsFilter,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const Template: StoryFn<ComponentProps<typeof PeriodStatsFilter>> = (
    props: ComponentProps<typeof PeriodStatsFilter>
) => {
    return (
        <ThemeProvider>
            <Provider store={configureMockStore()(defaultState)}>
                <PeriodStatsFilter {...props} />
            </Provider>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof PeriodStatsFilter> = {
    value: {
        end_datetime: moment().format(),
        start_datetime: moment().subtract(7, 'days').format(),
    },
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
