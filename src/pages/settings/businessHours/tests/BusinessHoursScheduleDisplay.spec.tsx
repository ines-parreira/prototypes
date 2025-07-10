import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserSettingType } from 'config/types/user'
import { TimeFormatType } from 'constants/datetime'
import { renderWithStore } from 'utils/testing'

import BusinessHoursScheduleDisplay from '../BusinessHoursScheduleDisplay'

const renderComponent = ({
    timeFormat,
}: {
    timeFormat?: TimeFormatType
} = {}) => {
    const storeState = {
        currentUser: fromJS({
            settings: [
                {
                    type: UserSettingType.Preferences,
                    data: {
                        time_format: timeFormat,
                    },
                },
            ],
        }),
    }

    return renderWithStore(
        <BusinessHoursScheduleDisplay
            schedule={[
                {
                    days: '1,2,3,4,5',
                    from_time: '09:00',
                    to_time: '17:00',
                },
                {
                    days: '6,7',
                    from_time: '10:00',
                    to_time: '18:00',
                },
            ]}
        />,
        storeState as any,
    )
}

describe('BusinessHoursScheduleDisplay', () => {
    it('should render all business hours with 24 hour format when the preference is set to 24 hour', () => {
        renderComponent({ timeFormat: TimeFormatType.TwentyFourHour })

        expect(
            screen.getByText('Mon-Fri, 09:00-17:00 | Weekend, 10:00-18:00'),
        ).toBeInTheDocument()
    })

    it('should render all business hours with 12 hour format when time format preference is set to 12 hour', () => {
        renderComponent({ timeFormat: TimeFormatType.AmPm })

        expect(
            screen.getByText(
                'Mon-Fri, 9:00 AM-5:00 PM | Weekend, 10:00 AM-6:00 PM',
            ),
        ).toBeInTheDocument()
    })
    it('should render all business hours with 12 hour format when no time format preference is set', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Mon-Fri, 9:00 AM-5:00 PM | Weekend, 10:00 AM-6:00 PM',
            ),
        ).toBeInTheDocument()
    })
})
