import type { ComponentProps } from 'react'
import React from 'react'

import { within } from '@testing-library/react'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'
import { userEvent } from 'storybook/test'

import { ThemeProvider } from 'core/theme'
import { PeriodFilterCompact } from 'domains/reporting/pages/common/filters/PeriodFilterCompact'

const defaultState = {}

const DATE = '2024-04-14T12:34:56.000Z'
const startDate = moment(DATE).subtract(7, 'days').toISOString()
const endDate = moment(DATE).endOf('day').toISOString()

const storyConfig: Meta = {
    title: 'Stats/Filters/PeriodFilterCompact',
    component: PeriodFilterCompact,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof PeriodFilterCompact>> = (
    props,
) => (
    <ThemeProvider>
        <Provider store={configureMockStore([thunk])(defaultState)}>
            <PeriodFilterCompact {...props} />
        </Provider>
    </ThemeProvider>
)

const defaultProps: ComponentProps<typeof PeriodFilterCompact> = {
    value: {
        start_datetime: startDate,
        end_datetime: endDate,
    },
}

export const Default = Template.bind({})
Default.args = defaultProps

export const Open = Template.bind({})
Open.args = defaultProps
Open.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /calendar/i }))
}

export const OpenWithMinDate = Template.bind({})
OpenWithMinDate.args = {
    ...defaultProps,
    initialSettings: {
        minDate: moment(DATE).subtract(2, 'months').toDate(),
    },
}
OpenWithMinDate.play = ({ canvasElement }) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button', { name: /calendar/i }))
}

export const OpenWithCustomMaxSpan = Template.bind({})
OpenWithCustomMaxSpan.args = {
    ...defaultProps,
    initialSettings: {
        maxSpan: 30,
    },
}
OpenWithCustomMaxSpan.play = ({ canvasElement }) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button', { name: /calendar/i }))
}

export default storyConfig
