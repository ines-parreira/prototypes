import {within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Meta, StoryFn} from '@storybook/react'
import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import {ThemeProvider} from 'theme'
import PeriodPicker from 'pages/stats/common/PeriodPicker'
import {getNewSetOfRanges} from 'pages/stats/PeriodStatsFilter'

const defaultState = {}

const DATE = '2024-04-14T12:34:56.000Z'
const rangeOptions = {default: undefined, custom: getNewSetOfRanges()}

const storyConfig: Meta = {
    title: 'Stats/PeriodPicker',
    component: PeriodPicker,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
    argTypes: {
        dateRanges: {
            options: ['custom', 'default'],
            mapping: rangeOptions,
            control: {
                type: 'radio',
            },
        },
        actionButtonsOnTheBottom: {
            defaultValue: false,
            control: {
                type: 'boolean',
            },
        },
        rangeDatesInFooter: {
            defaultValue: false,
            control: {
                type: 'boolean',
            },
            if: {arg: 'actionButtonsOnTheBottom'},
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
    endDatetime: moment(DATE),
    startDatetime: moment(DATE).subtract(7, 'days'),
    onChange: () => {},
    pickerV2Styles: false,
    rangesOnLeft: false,
    showRangesLabel: true,
    changeButtonColorsToV2: false,
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.play = ({canvasElement}) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button'))
}

export default storyConfig
