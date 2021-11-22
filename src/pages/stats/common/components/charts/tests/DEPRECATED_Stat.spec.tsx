import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import axios, {CancelTokenSource} from 'axios'

import {
    TICKETS_CREATED_PER_CHANNEL_PER_DAY,
    RESOLUTION_TIME,
    LATEST_SATISFACTION_SURVEYS,
    REVENUE_OVERVIEW,
    TICKET_CREATED_PER_HOUR_PER_WEEKDAY,
    CURRENT_DATE,
} from '../../../../../../config/stats'
import client from '../../../../../../models/api/resources'
import {Stat} from '../../../../../../models/stat/types'
import * as fileUtils from '../../../../../../utils/file'
import {StatContainer} from '../DEPRECATED_Stat'
import {user} from '../../../../../../fixtures/users'
import {account} from '../../../../../../fixtures/account'
import {logEvent} from '../../../../../../store/middlewares/segmentTracker.js'
import {SegmentEvent} from '../../../../../../store/middlewares/types/segmentTracker'

jest.spyOn(fileUtils, 'saveFileAsDownloaded')

jest.mock('../BarStat', () => () => <div>BarStat</div>)

jest.mock('../LineStat', () => () => <div>LineStat</div>)

jest.mock('../TableStat/TableStat', () => () => <div>TableStat</div>)

jest.mock('../KeyMetricStat/KeyMetricStat', () => () => (
    <div>KeyMetricStat</div>
))

jest.mock('../PerHourPerWeekTableStat/PerHourPerWeekTableStat', () => () => (
    <div>PerHourPerWeekTableStat</div>
))

jest.mock('../../StatCurrentDate', () => () => <div>StatCurrentDate</div>)

jest.mock('../../../../../../store/middlewares/segmentTracker.js')

const minProps = {
    name: 'stat_name',
    tagColors: null,
    notify: jest.fn(),
    filters: fromJS({}),
    isFetching: false,
    currentUser: fromJS(user),
    account: fromJS(account),
    stat: {data: {label: 'Stat label'}} as Stat,
}

const mockedServer = new MockAdapter(client)
mockedServer
    .onAny(`/api/stats/${TICKETS_CREATED_PER_CHANNEL_PER_DAY}/download`)
    .reply(200, 'foo', {'content-disposition': 'csv'})

const mockedCancelRequest = jest.fn()

describe('Stat', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render a bar chart', () => {
        const {container} = render(
            <StatContainer
                {...minProps}
                name={TICKETS_CREATED_PER_CHANNEL_PER_DAY}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a line chart', () => {
        const {container} = render(
            <StatContainer {...minProps} name={RESOLUTION_TIME} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a table chart', () => {
        const {container} = render(
            <StatContainer {...minProps} name={LATEST_SATISFACTION_SURVEYS} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a key metrics chart', () => {
        const {container} = render(
            <StatContainer {...minProps} name={REVENUE_OVERVIEW} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a per hour per week table', () => {
        const {container} = render(
            <StatContainer
                {...minProps}
                name={TICKET_CREATED_PER_HOUR_PER_WEEKDAY}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a non chart element', () => {
        const {container} = render(
            <StatContainer {...minProps} name={CURRENT_DATE} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should download a file when clicking on the download button', async () => {
        const {getByText} = render(
            <StatContainer
                {...minProps}
                name={TICKETS_CREATED_PER_CHANNEL_PER_DAY}
                downloadable
            />
        )

        fireEvent.click(getByText(/CSV/i))
        await waitFor(() => {
            expect(logEvent).toBeCalledWith(SegmentEvent.StatDownloadClicked, {
                account_domain: account['domain'],
                name: TICKETS_CREATED_PER_CHANNEL_PER_DAY,
                user_id: user['id'],
            })
            expect(fileUtils.saveFileAsDownloaded).toHaveBeenNthCalledWith(
                1,
                `${TICKETS_CREATED_PER_CHANNEL_PER_DAY}.csv`,
                'foo',
                'csv'
            )
        })
    })

    it('should cancel downloading a file when unmounting', () => {
        jest.spyOn(axios.CancelToken, 'source').mockImplementation(
            () =>
                ({
                    token: undefined,
                    cancel: mockedCancelRequest,
                } as unknown as CancelTokenSource)
        )
        const {getByText, unmount} = render(
            <StatContainer
                {...minProps}
                name={TICKETS_CREATED_PER_CHANNEL_PER_DAY}
                downloadable
            />
        )

        fireEvent.click(getByText(/CSV/i))
        unmount()
        expect(mockedCancelRequest).toHaveBeenCalledTimes(1)
    })
})
