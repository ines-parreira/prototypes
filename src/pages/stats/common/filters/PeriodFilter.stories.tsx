import {within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Meta, StoryFn} from '@storybook/react'
import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import {ThemeProvider} from 'theme'
import PeriodFilter from 'pages/stats/common/filters/PeriodFilter'

const defaultState = {}

const DATE = '2024-04-14T12:34:56.000Z'

const startDate = moment(DATE).subtract(7, 'days').toISOString()
const endDateTime = moment(DATE).endOf('day').toISOString()

const storyConfig: Meta = {
    title: 'Common/Filters/PeriodFilter',
    component: PeriodFilter,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const Template: StoryFn<ComponentProps<typeof PeriodFilter>> = (
    props: ComponentProps<typeof PeriodFilter>
) => {
    return (
        <ThemeProvider>
            <Provider store={configureMockStore()(defaultState)}>
                <PeriodFilter {...props} />
            </Provider>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof PeriodFilter> = {
    value: {
        end_datetime: endDateTime,
        start_datetime: startDate,
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.play = ({canvasElement}) => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 186,
    })
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByTestId('filter-value'))
}

export default storyConfig
