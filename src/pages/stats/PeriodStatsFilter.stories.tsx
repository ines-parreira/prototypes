import {within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Meta, StoryFn} from '@storybook/react'
import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import {ThemeProvider} from 'theme'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import {FeatureFlagKey} from 'config/featureFlags'

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

const pickerV2Props: ComponentProps<typeof PeriodStatsFilter> = {
    ...defaultProps,
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = {
    flags: {[FeatureFlagKey.NewDatePickerVariant]: false},
}
Default.play = ({canvasElement}) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button'))
}

export const PickerV2 = Template.bind({})
PickerV2.args = pickerV2Props
PickerV2.parameters = {
    flags: {[FeatureFlagKey.NewDatePickerVariant]: true},
}
PickerV2.play = ({canvasElement}) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button'))
}

export default storyConfig
