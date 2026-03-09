import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { ThemeProvider } from 'core/theme'
import { DatePicker } from 'pages/common/forms/DatePicker'

const DATE = '2024-04-14T12:34:56.000Z'

const storyConfig: Meta = {
    title: 'Data Entry/DatePicker',
    component: DatePicker,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof DatePicker>> = (
    props: ComponentProps<typeof DatePicker>,
) => {
    return (
        <ThemeProvider>
            {/** fixes the flaky chromatic tests issue */}
            <div style={{ paddingLeft: '100px' }}>
                <DatePicker {...props}>
                    <input type="text" placeholder="Choose a date..." />
                </DatePicker>
            </div>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof DatePicker> = {
    onSubmit: () => undefined,
    initialSettings: {
        alwaysShowCalendars: true,
        applyButtonClasses: 'btn-primary',
        cancelButtonClasses: 'btn-secondary',
        opens: 'left',
        showCustomRangeLabel: false,
        singleDatePicker: true,
        timePicker: false,
        startDate: new Date(DATE),
    },
    isOpen: true,
    additionalPickerClassName: 'add-calendar-spacing',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
