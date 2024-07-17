import {within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Meta, StoryFn} from '@storybook/react'
import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import {ThemeProvider} from 'theme'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'

const defaultState = {}
const DATE = '2023-04-14T12:34:56.000Z'

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
        end_datetime: moment(DATE).format(),
        start_datetime: moment(DATE).subtract(7, 'days').format(),
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.play = ({canvasElement}) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button'))
}

export default storyConfig
