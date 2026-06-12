import type { ComponentProps } from 'react'

import { logEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { noop } from '@gorgias/toolkit'

import { FIRST_RESPONSE_TIME } from 'domains/reporting/config/stats'
import { downloadStat } from 'domains/reporting/models/stat/resources'
import { StatWrapper } from 'domains/reporting/pages/common/layout/StatWrapper'
import { account } from 'fixtures/account'
import { firstResponseTime } from 'fixtures/stats'
import { user } from 'fixtures/users'
import type { RootState } from 'state/types'
import { saveFileAsDownloaded } from 'utils/file'

jest.mock('utils/file')
jest.mock('domains/reporting/models/stat/resources')
jest.mock('@repo/logging')

const mockStore = configureMockStore([thunk])
const saveFileAsDownloadedMock = saveFileAsDownloaded as jest.MockedFunction<
    typeof saveFileAsDownloaded
>
const downloadStatMock = downloadStat as jest.MockedFunction<
    typeof downloadStat
>
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

describe('StatWrapper', () => {
    const minProps: ComponentProps<typeof StatWrapper> = {
        stat: firstResponseTime,
        isFetchingStat: false,
        resourceName: FIRST_RESPONSE_TIME,
        statsFilters: {
            period: {
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
        downloadStatMock.mockResolvedValue({
            name: 'foo.txt',
            contentType: 'text/plain',
            data: 'foo',
        })
    })

    it('should pass stat to children function', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps}>
                    {(stat) => JSON.stringify(stat.toJS(), null, 2)}
                </StatWrapper>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the loader when stat is fetching', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps} isFetchingStat />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the children nor the title when stat is null', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps} stat={null} />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the help icon and help tooltip when help text prop is defined', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper
                    {...minProps}
                    helpText="Foo help text"
                    helpAutoHide={false}
                />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the download button when isDownloadable is set to true', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps} isDownloadable />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should download stat on download button click', async () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps} isDownloadable />
            </Provider>,
        )
        fireEvent.click(getByText('file_download'))
        await waitFor(() => {
            expect(saveFileAsDownloadedMock).toBeCalled()
        })

        expect(saveFileAsDownloadedMock.mock.calls).toMatchSnapshot()
    })

    it('should display download error', async () => {
        downloadStatMock.mockRejectedValue({
            response: { data: { error: { msg: 'foo error' } } },
        })

        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps} isDownloadable />
            </Provider>,
        )
        fireEvent.click(getByText('file_download'))
        await waitFor(() => {
            expect(downloadStatMock).toBeCalled()
        })

        const toastEl = await screen.findByRole('status', { name: 'foo error' })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('should display spinner while downloading the stat', () => {
        downloadStatMock.mockImplementation(() => new Promise(noop))

        const { container, getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps} isDownloadable />
            </Provider>,
        )
        fireEvent.click(getByText('file_download'))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log event on download button click', () => {
        downloadStatMock.mockImplementation(() => new Promise(noop))

        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <StatWrapper {...minProps} isDownloadable />
            </Provider>,
        )
        fireEvent.click(getByText('file_download'))

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
