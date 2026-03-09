import type { ComponentProps } from 'react'

import { within } from '@testing-library/react'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'
import { userEvent } from 'storybook/test'

import { ThemeProvider } from 'core/theme'
import { PeriodFilter } from 'domains/reporting/pages/common/filters/PeriodFilter'
import { FILTER_DROPDOWN_ICON } from 'pages/common/forms/FilterInput/constants'

const defaultState = {}

const DATE = '2024-04-14T12:34:56.000Z'

const startDate = moment(DATE).subtract(7, 'days').toISOString()
const endDateTime = moment(DATE).endOf('day').toISOString()

const storyConfig: Meta = {
    title: 'Stats/Filters/PeriodFilter',
    component: PeriodFilter,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof PeriodFilter>> = (
    props: ComponentProps<typeof PeriodFilter>,
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
Default.play = ({ canvasElement }) => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 186,
    })
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByText(FILTER_DROPDOWN_ICON))
}

export default storyConfig
