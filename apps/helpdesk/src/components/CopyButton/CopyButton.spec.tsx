import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import copy from 'copy-to-clipboard'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { notify } from 'state/notifications/actions'

import CopyButton from './CopyButton'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('copy-to-clipboard', () => jest.fn())
const copyMock = copy as jest.MockedFunction<typeof copy>

jest.mock('@repo/logging')

describe('<Copy/>', () => {
    const mockStore = configureMockStore()
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should copy on clipboard', () => {
        const store = mockStore({
            currentAccount: fromJS({ domain: 'domain' }),
        })
        render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS({ type: 'type' }),
                        integrationId: 1,
                    }}
                >
                    <CopyButton value="test" />
                </IntegrationContext.Provider>
            </Provider>,
        )

        fireEvent.click(screen.getByRole('button'))
        expect(copyMock).toHaveBeenCalledWith('test')
    })

    it('should notify the user about the copy', () => {
        const store = mockStore({})
        render(
            <Provider store={store}>
                <CopyButton value="test" />
            </Provider>,
        )

        fireEvent.click(screen.getByRole('button'))
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
                <CopyButton value="test" onCopyMessage="Test Message" />
            </Provider>,
        )

        fireEvent.click(screen.getByRole('button'))
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
                <CopyButton value="test" onCopyMessage="Test Message" />
            </Provider>,
        )

        fireEvent.click(screen.getByRole('button'))
        expect(notify).toHaveBeenCalledWith({
            status: 'error',
            title: 'Failed to copy',
        })
        expect(mockedDispatch).toHaveBeenCalled()
    })
})
