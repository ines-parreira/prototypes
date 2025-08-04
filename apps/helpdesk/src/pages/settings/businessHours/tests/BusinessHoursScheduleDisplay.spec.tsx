import { assumeMock } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { UserSettingType } from 'config/types/user'
import { TimeFormatType } from 'constants/datetime'
import { useTextOverflow } from 'pages/common/hooks/useTextOverflow'
import { renderWithStore } from 'utils/testing'

import BusinessHoursScheduleDisplay from '../BusinessHoursScheduleDisplay'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useId: jest.fn().mockImplementation(() => 'test-id'),
}))
jest.mock('pages/common/hooks/useTextOverflow')

const useTextOverflowMock = assumeMock(useTextOverflow)

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
            businessHoursConfig={{
                business_hours: [
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
                ],
                timezone: 'UTC',
            }}
        />,
        storeState as any,
    )
}

describe('BusinessHoursScheduleDisplay', () => {
    beforeEach(() => {
        useTextOverflowMock.mockReturnValue({
            ref: { current: null },
            isOverflowing: false,
        })
    })

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

    it('should show complete schedule when text overflows', async () => {
        const user = userEvent.setup()

        useTextOverflowMock.mockReturnValue({
            ref: { current: null },
            isOverflowing: true,
        })

        renderComponent()

        const textElement = screen.getByText(
            'Mon-Fri, 9:00 AM-5:00 PM | Weekend, 10:00 AM-6:00 PM',
        )

        await act(() => user.hover(textElement))

        await waitFor(() => {
            const tooltip = screen.getByRole('tooltip')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent('Schedule')
            expect(tooltip).toHaveTextContent('Mon-Fri, 9:00 AM-5:00 PM')
            expect(tooltip).toHaveTextContent('Weekend, 10:00 AM-6:00 PM')
        })
    })

    it('should not show tooltip when text does not overflow', async () => {
        const user = userEvent.setup()

        useTextOverflowMock.mockReturnValue({
            ref: { current: null },
            isOverflowing: false,
        })

        renderComponent()

        const textElement = screen.getByText(
            'Mon-Fri, 9:00 AM-5:00 PM | Weekend, 10:00 AM-6:00 PM',
        )

        await act(() => user.hover(textElement))

        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })
    })
})
