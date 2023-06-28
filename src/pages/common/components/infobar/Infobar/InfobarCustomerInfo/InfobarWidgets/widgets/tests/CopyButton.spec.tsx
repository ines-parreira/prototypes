import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import copy from 'copy-to-clipboard'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import {notify} from 'state/notifications/actions'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {Copy} from '../CopyButton'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('copy-to-clipboard', () => jest.fn())
const copyMock = copy as jest.MockedFunction<typeof copy>

jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

describe('<Copy/>', () => {
    const mockStore = configureMockStore()
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should copy on clipboard', () => {
        const store = mockStore({
            currentAccount: fromJS({domain: 'domain'}),
        })
        render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({type: 'type'}),
                        integrationId: 1,
                    }}
                >
                    <Copy className="" name="name" value="test" />
                </IntegrationContext.Provider>
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(copyMock).toHaveBeenCalledWith('test')
        expect(logEventMock).toHaveBeenLastCalledWith(
            SegmentEvent.InfobarFieldCopied,
            {
                account_domain: 'domain',
                name: 'name',
                integration_type: 'type',
            }
        )
    })

    it('should notify the user about the copy', () => {
        const store = mockStore({})
        render(
            <Provider store={store}>
                <Copy className="" name="name" value="test" />
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(notify).toHaveBeenCalledWith({
            status: 'success',
            title: 'Copied!',
        })
        expect(mockedDispatch).toHaveBeenCalled()
    })

    it('should notify the user about the copy with a custom message', () => {
        const store = mockStore({})
        render(
            <Provider store={store}>
                <Copy
                    className=""
                    name="name"
                    value="test"
                    onCopyMessage="Test Message"
                />
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(notify).toHaveBeenCalledWith({
            status: 'success',
            title: 'Test Message',
        })
        expect(mockedDispatch).toHaveBeenCalled()
    })

    it('should notify the user about the copy error', () => {
        const store = mockStore({})
        copyMock.mockImplementation(() => {
            throw new Error('User not found')
        })
        render(
            <Provider store={store}>
                <Copy
                    className=""
                    name="name"
                    value="test"
                    onCopyMessage="Test Message"
                />
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(notify).toHaveBeenCalledWith({
            status: 'error',
            title: 'Failed to copy',
        })
        expect(mockedDispatch).toHaveBeenCalled()
    })
})
