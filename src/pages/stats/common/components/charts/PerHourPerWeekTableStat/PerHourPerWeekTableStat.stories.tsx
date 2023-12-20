import {Meta, StoryFn} from '@storybook/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {PerHourPerWeekTableStatContainer} from 'pages/stats/common/components/charts/PerHourPerWeekTableStat/PerHourPerWeekTableStat'
import {account} from 'fixtures/account'
import {statPerHourPerWeekData} from 'fixtures/stats'
import {ThemeProvider, useTheme} from 'theme'

const storyConfig: Meta = {
    title: 'Stats/PerHourPerWeekTableStat',
    component: PerHourPerWeekTableStatContainer,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
    decorators: [
        (Component) => (
            <ThemeProvider>
                <Component />
            </ThemeProvider>
        ),
    ],
}

const defaultProps: ComponentProps<typeof PerHourPerWeekTableStatContainer> = {
    businessHoursSettings: fromJS(account.settings[0]),
    currentUserTimezone: '',
    config: fromJS({}),
    meta: fromJS({}),
    data: fromJS(statPerHourPerWeekData),
    dispatch: (() => null) as any,
}

const Template: StoryFn<
    ComponentProps<typeof PerHourPerWeekTableStatContainer>
> = (props) => {
    const theme = useTheme()
    return (
        <div className={theme}>
            <PerHourPerWeekTableStatContainer {...props} />
        </div>
    )
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
