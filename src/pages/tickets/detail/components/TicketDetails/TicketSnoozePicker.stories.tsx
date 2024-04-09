import React, {ComponentProps} from 'react'
import {Meta, StoryFn} from '@storybook/react'
import {ThemeProvider} from 'theme'
import TicketSnoozePicker from 'pages/tickets/detail/components/TicketDetails/TicketSnoozePicker'

const storyConfig: Meta = {
    title: 'Tickets/TicketSnoozePicker',
    component: TicketSnoozePicker,
    parameters: {
        chromatic: {disableSnapshot: true},
    },
}

const Template: StoryFn<ComponentProps<typeof TicketSnoozePicker>> = (
    props: ComponentProps<typeof TicketSnoozePicker>
) => {
    return (
        <ThemeProvider>
            <TicketSnoozePicker {...props}>
                <input type="text" />
            </TicketSnoozePicker>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof TicketSnoozePicker> = {
    onSubmit: () => undefined,
    isOpen: true,
    timezone: null,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
