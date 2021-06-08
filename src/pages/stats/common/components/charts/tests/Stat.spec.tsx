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
} from '../../../../../../config/stats'
import client from '../../../../../../models/api/resources'
import {Stat} from '../../../../../../models/stat/types'
import * as fileUtils from '../../../../../../utils/file'
import {StatContainer} from '../Stat'

jest.spyOn(fileUtils, 'saveFileAsDownloaded')

jest.mock('../BarStat.js', () => () => <div>BarStat</div>)

jest.mock('../LineStat', () => () => <div>LineStat</div>)

jest.mock('../TableStat/TableStat.js', () => () => <div>TableStat</div>)

jest.mock('../KeyMetricStat/KeyMetricStat.js', () => () => (
    <div>KeyMetricStat</div>
))

jest.mock('../PerHourPerWeekTableStat/PerHourPerWeekTableStat.js', () => () => (
    <div>PerHourPerWeekTableStat</div>
))

const minProps = {
    name: 'stat_name',
    tagColors: null,
    notify: jest.fn(),
    filters: fromJS({}),
    loading: false,
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
                (({
                    token: undefined,
                    cancel: mockedCancelRequest,
                } as unknown) as CancelTokenSource)
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
