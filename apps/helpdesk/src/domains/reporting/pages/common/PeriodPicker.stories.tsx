import type { ComponentProps } from 'react'

import type { Meta, StoryFn, StoryObj } from '@storybook/react'
import { within } from '@testing-library/react'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { userEvent } from 'storybook/test'

import { ThemeProvider } from 'core/theme'
import PeriodPicker from 'domains/reporting/pages/common/PeriodPicker'
import { getNewSetOfRanges } from 'domains/reporting/pages/constants'

const defaultState = {}

const DATE = '2024-04-14T12:34:56.000Z'
const rangeOptions = { default: undefined, custom: getNewSetOfRanges() }

const storyConfig: Meta = {
    title: 'Stats/PeriodPicker',
    component: PeriodPicker,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof PeriodPicker>> = (
    props: ComponentProps<typeof PeriodPicker>,
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
}

const pickerV2Props: ComponentProps<typeof PeriodPicker> = {
    ...defaultProps,
    pickerV2Styles: true,
    rangesOnLeft: true,
    showRangesLabel: false,
    changeButtonColorsToV2: true,
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.play = ({ canvasElement }) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button'))
}

export default storyConfig

type Story = StoryObj<typeof PeriodPicker>

export const PeriodPickerV2: Story = {
    argTypes: {
        dateRanges: {
            options: ['custom', 'default'],
            mapping: rangeOptions,
            control: {
                type: 'radio',
            },
        },
        actionButtonsOnTheBottom: {
            control: {
                type: 'boolean',
            },
        },
        rangeDatesInFooter: {
            control: {
                type: 'boolean',
            },
            if: { arg: 'actionButtonsOnTheBottom' },
        },
    },
    args: {
        ...pickerV2Props,
        actionButtonsOnTheBottom: true,
        rangeDatesInFooter: true,
        dateRanges: rangeOptions.custom,
    },
    render: (props) => (
        <ThemeProvider>
            <Provider store={configureMockStore()(defaultState)}>
                <PeriodPicker {...props} />
            </Provider>
        </ThemeProvider>
    ),
}

PeriodPickerV2.play = ({ canvasElement }) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button'))
}
