import type { ComponentProps } from 'react'

import { within } from '@testing-library/react'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'
import { userEvent } from 'storybook/test'

import { ThemeProvider } from 'core/theme'
import PeriodStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_PeriodStatsFilter'

const defaultState = {}
const DATE = '2023-04-14T12:34:56.000Z'

const storyConfig: Meta = {
    title: 'Stats/PeriodStatsFilter',
    component: PeriodStatsFilter,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof PeriodStatsFilter>> = (
    props: ComponentProps<typeof PeriodStatsFilter>,
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
Default.play = ({ canvasElement }) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('button'))
}

export default storyConfig
