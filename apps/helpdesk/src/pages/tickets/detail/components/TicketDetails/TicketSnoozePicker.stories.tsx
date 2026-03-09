import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { ThemeProvider } from 'core/theme'
import TicketSnoozePicker from 'pages/tickets/detail/components/TicketDetails/TicketSnoozePicker'

const defaultState = {}

const storyConfig: Meta = {
    title: 'Tickets/TicketSnoozePicker',
    component: TicketSnoozePicker,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof TicketSnoozePicker>> = (
    props: ComponentProps<typeof TicketSnoozePicker>,
) => {
    return (
        <ThemeProvider>
            <Provider store={configureMockStore()(defaultState)}>
                <TicketSnoozePicker {...props}>
                    <input type="text" />
                </TicketSnoozePicker>
            </Provider>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof TicketSnoozePicker> = {
    onSubmit: () => undefined,
    isOpen: true,
    timezone: null,
    datetime: '2099-12-01T06:00:00.000Z',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
