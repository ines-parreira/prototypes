import React, {ComponentProps} from 'react'
import {Meta, StoryFn} from '@storybook/react'
import {ThemeProvider} from 'theme'
import TicketSnoozePicker from 'pages/tickets/detail/components/TicketDetails/TicketSnoozePicker'
import {FeatureFlagKey} from 'config/featureFlags'

const storyConfig: Meta = {
    title: 'Tickets/TicketSnoozePicker',
    component: TicketSnoozePicker,
    parameters: {
        chromatic: {disableSnapshot: false},
        flags: {[FeatureFlagKey.NewTicketSnoozeAndTicketDate]: false},
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
    datetime: '2099-12-01T06:00:00.000Z',
}

export const Default = Template.bind({})
Default.args = defaultProps

export const SnoozePickerV2 = Template.bind({})
SnoozePickerV2.args = defaultProps
SnoozePickerV2.parameters = {
    flags: {[FeatureFlagKey.NewTicketSnoozeAndTicketDate]: true},
}

export default storyConfig
