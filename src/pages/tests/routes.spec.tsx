import React from 'react'
import {createBrowserHistory} from 'history'

import {logPageChange} from '../../store/middlewares/segmentTracker'
import {renderWithRouter} from '../../utils/testing'
import Routes from '../routes'

jest.mock('../../store/middlewares/segmentTracker')
const logPageMock = logPageChange as jest.Mock

jest.mock('../App', () => () => <div>App</div>)

const mockHistory = createBrowserHistory()

describe('<Routes/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not log page change via segment on initial render', () => {
        renderWithRouter(<Routes />, {history: mockHistory})
        expect(logPageMock).not.toHaveBeenCalled()
    })

    it('should log page change after location change', () => {
        const {rerender} = renderWithRouter(<Routes />, {
            history: mockHistory,
        })
        mockHistory.push('/app/settings/profile')
        rerender(<Routes />)
        expect(logPageMock).toHaveBeenCalledTimes(1)
    })
})
