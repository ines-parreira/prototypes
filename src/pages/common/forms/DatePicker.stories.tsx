import React, {ComponentProps} from 'react'
import {Meta, StoryFn} from '@storybook/react'
import {ThemeProvider} from 'theme'
import {DatePicker} from 'pages/common/forms/DatePicker'

const storyConfig: Meta = {
    title: 'Data Entry/DatePicker',
    component: DatePicker,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const Template: StoryFn<ComponentProps<typeof DatePicker>> = (
    props: ComponentProps<typeof DatePicker>
) => {
    return (
        <ThemeProvider>
            <DatePicker {...props}>
                <input type="text" placeholder="Choose a date..." />
            </DatePicker>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof DatePicker> = {
    onSubmit: () => undefined,
    initialSettings: {
        alwaysShowCalendars: true,
        applyButtonClasses: 'btn-success mr-2',
        cancelButtonClasses: 'btn-secondary',
        opens: 'left',
        showCustomRangeLabel: false,
        singleDatePicker: true,
        timePicker: false,
        startDate: new Date(),
    },
    isOpen: true,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
