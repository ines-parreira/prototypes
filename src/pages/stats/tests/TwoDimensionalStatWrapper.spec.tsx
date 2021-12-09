import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import _noop from 'lodash/noop'
import {fromJS} from 'immutable'

import TwoDimensionalChartWrapper from '../TwoDimensionalStatWrapper'
import {firstResponseTimeStat} from '../../../fixtures/stats'
import {FIRST_RESPONSE_TIME} from '../../../config/stats'
import {StatsFilterType} from '../../../state/stats/types'
import {saveFileAsDownloaded} from '../../../utils/file'
import {notify} from '../../../state/notifications/actions'
import {downloadStat} from '../../../models/stat/resources'
import {logEvent} from '../../../store/middlewares/segmentTracker.js'
import {RootState} from '../../../state/types'
import {user} from '../../../fixtures/users'
import {account} from '../../../fixtures/account'

jest.mock('../../../utils/file')
jest.mock('../../../state/notifications/actions')
jest.mock('../../../models/stat/resources')
jest.mock('../../../store/middlewares/segmentTracker.js')

const mockStore = configureMockStore([thunk])
const saveFileAsDownloadedMock = saveFileAsDownloaded as jest.MockedFunction<
    typeof saveFileAsDownloaded
>
const downloadStatMock = downloadStat as jest.MockedFunction<
    typeof downloadStat
>
const notifyMock = notify as jest.MockedFunction<typeof notify>
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

describe('TwoDimensionalStatWrapper', () => {
    const minProps: ComponentProps<typeof TwoDimensionalChartWrapper> = {
        stat: firstResponseTimeStat,
        isFetchingStat: false,
        resourceName: FIRST_RESPONSE_TIME,
        statsFilters: {
            [StatsFilterType.Period]: {
                start_datetime: '2021-04-02T00:00:00.000Z',
                end_datetime: '2021-04-02T23:59:59.999Z',
            },
        },
        children: () => 'children',
    }
    const defaultState = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        notifyMock.mockImplementation(
            (message) => () =>
                message
                    ? Promise.resolve({
                          type: 'notify mock',
                          message,
                      })
                    : Promise.resolve()
        )
        downloadStatMock.mockResolvedValue({
            name: 'foo.txt',
            contentType: 'text/plain',
            data: 'foo',
        })
    })

    it('should pass stat to children function', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps}>
                    {(stat) => JSON.stringify(stat.toJS(), null, 2)}
                </TwoDimensionalChartWrapper>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the loader when stat is fetching', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps} isFetchingStat />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the children nor the title when stat is null', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps} stat={null} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the help icon when help text prop is defined', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper
                    {...minProps}
                    helpText="Foo help text"
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the download button when isDownloadable is set to true', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps} isDownloadable />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should download stat on download button click', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps} isDownloadable />
            </Provider>
        )
        fireEvent.click(getByText('file_download'))
        await waitFor(() => {
            expect(saveFileAsDownloadedMock).toBeCalled()
        })

        expect(saveFileAsDownloadedMock.mock.calls).toMatchSnapshot()
    })

    it('should display download error', async () => {
        downloadStatMock.mockRejectedValue({
            response: {data: {error: {msg: 'foo error'}}},
        })

        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps} isDownloadable />
            </Provider>
        )
        fireEvent.click(getByText('file_download'))
        await waitFor(() => {
            expect(downloadStatMock).toBeCalled()
        })

        expect(notifyMock.mock.calls).toMatchSnapshot()
    })

    it('should display spinner while downloading the stat', () => {
        downloadStatMock.mockImplementation(() => new Promise(_noop))

        const {container, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps} isDownloadable />
            </Provider>
        )
        fireEvent.click(getByText('file_download'))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log event on download button click', () => {
        downloadStatMock.mockImplementation(() => new Promise(_noop))

        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TwoDimensionalChartWrapper {...minProps} isDownloadable />
            </Provider>
        )
        fireEvent.click(getByText('file_download'))

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
