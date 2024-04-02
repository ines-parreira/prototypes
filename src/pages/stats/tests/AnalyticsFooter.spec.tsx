import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {
    AnalyticsFooter,
    generateTimeZoneMessage,
} from 'pages/stats/AnalyticsFooter'
import {getTimezone} from 'state/currentUser/selectors'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock('state/currentUser/selectors')
const getTimezoneMock = assumeMock(getTimezone)

describe('<AnalyticsFooter />', () => {
    it('should render message with User`s Timezone', () => {
        const timeZone = 'SomeTimezone'
        getTimezoneMock.mockReturnValue(timeZone)

        render(
            <Provider store={mockStore({} as any)}>
                <AnalyticsFooter />
            </Provider>
        )

        expect(screen.getByText(new RegExp(timeZone))).toBeInTheDocument()
        expect(
            screen.getByText(generateTimeZoneMessage(timeZone))
        ).toBeInTheDocument()
    })

    it('should render default Timezone if User`s Timezone is not available', () => {
        getTimezoneMock.mockReturnValue(null)

        render(
            <Provider store={mockStore({} as any)}>
                <AnalyticsFooter />
            </Provider>
        )

        expect(
            screen.getByText(new RegExp(DEFAULT_TIMEZONE))
        ).toBeInTheDocument()
    })
})
