import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import {
    AnalyticsFooter,
    generateBusinessHoursTimeZoneMessage,
    generateTimeZoneMessage,
} from 'pages/stats/AnalyticsFooter'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { AccountSettingBusinessHours } from 'state/currentAccount/types'
import { getTimezone } from 'state/currentUser/selectors'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock('state/currentUser/selectors')
jest.mock('state/currentAccount/selectors')
const getTimezoneMock = assumeMock(getTimezone)
const getBusinessHoursSettingsMock = assumeMock(getBusinessHoursSettings)

describe('<AnalyticsFooter />', () => {
    it('should render message with User`s Timezone', () => {
        const timeZone = 'SomeTimezone'
        getTimezoneMock.mockReturnValue(timeZone)

        render(
            <Provider store={mockStore({} as any)}>
                <AnalyticsFooter />
            </Provider>,
        )

        expect(screen.getByText(new RegExp(timeZone))).toBeInTheDocument()
        expect(
            screen.getByText(generateTimeZoneMessage(timeZone)),
        ).toBeInTheDocument()
    })

    it('should render default Timezone if User`s Timezone is not available', () => {
        getTimezoneMock.mockReturnValue(null)

        render(
            <Provider store={mockStore({} as any)}>
                <AnalyticsFooter />
            </Provider>,
        )

        expect(
            screen.getByText(new RegExp(DEFAULT_TIMEZONE)),
        ).toBeInTheDocument()
    })

    it('should render message with Business Hours Timezone if useBusinessHoursTimezone is true', () => {
        const businessHoursTimezone = 'SomeBusinessHoursTimezone'
        getTimezoneMock.mockReturnValue('SomeTimezone')
        getBusinessHoursSettingsMock.mockReturnValue({
            data: { timezone: businessHoursTimezone },
        } as AccountSettingBusinessHours)

        render(
            <Provider store={mockStore({} as any)}>
                <AnalyticsFooter useBusinessHoursTimezone />
            </Provider>,
        )

        expect(
            screen.getByText(new RegExp(businessHoursTimezone)),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                generateBusinessHoursTimeZoneMessage(businessHoursTimezone),
            ),
        ).toBeInTheDocument()
    })
})
