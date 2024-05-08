import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Meta, StoryFn} from '@storybook/react'
import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import {ThemeProvider} from 'theme'
import PeriodPicker from 'pages/stats/common/PeriodPicker'
import {getNewSetOfRanges} from 'pages/stats/PeriodStatsFilter'

const defaultState = {}

const rangeOptions = {default: undefined, custom: getNewSetOfRanges()}

const storyConfig: Meta = {
    title: 'Stats/PeriodPicker',
    component: PeriodPicker,
    parameters: {
        chromatic: {disableSnapshot: true},
    },
    argTypes: {
        dateRanges: {
            options: ['custom', 'default'],
            mapping: rangeOptions,
            control: {
                type: 'radio',
            },
        },
    },
}

const Template: StoryFn<ComponentProps<typeof PeriodPicker>> = (
    props: ComponentProps<typeof PeriodPicker>
) => {
    return (
        <ThemeProvider>
            <Provider store={configureMockStore()(defaultState)}>
                <PeriodPicker {...props} />
            </Provider>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof PeriodPicker> = {
    endDatetime: moment(),
    startDatetime: moment().subtract(7, 'days'),
    onChange: () => {},
    pickerV2Styles: false,
    rangesOnLeft: false,
    showRangesLabel: true,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
