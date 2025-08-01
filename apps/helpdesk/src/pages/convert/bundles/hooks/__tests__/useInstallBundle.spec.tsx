import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import MockAdapter from 'axios-mock-adapter'

import { convertBundleActionResponse } from 'fixtures/convertBundle'
import useAppDispatch from 'hooks/useAppDispatch'
import client from 'models/api/resources'
import { BundleInstallationMethod } from 'models/convert/bundle/types'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useInstallBundle } from '../useInstallBundle'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('models/api/resources')
jest.mock('state/notifications/actions')

const queryClient = mockQueryClient()

const useAppDispatchMock = assumeMock(useAppDispatch)
const notifyMock = assumeMock(notify)

const mockedServer = new MockAdapter(client)

describe('useInstallBundle', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.restoreAllMocks()

        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)

        mockedServer.reset()
    })

    it('should call installBundle correctly on manual install', async () => {
        const onSubmit = jest.fn()

        mockedServer
            .onPost('/api/revenue-addon-bundle/manual-install/')
            .reply(200, convertBundleActionResponse)

        const { result } = renderHook(
            () =>
                useInstallBundle(1, BundleInstallationMethod.Manual, onSubmit),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        const { installBundle } = result.current

        expect(installBundle).toBeInstanceOf(Function)

        await installBundle()

        expect(notifyMock).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Ready for installation, please follow the instructions',
        })
        expect(onSubmit).toHaveBeenCalledWith(convertBundleActionResponse)
        expect(dispatch).toHaveBeenCalled()
    })

    it('should call installBundle correctly on 1 click install', async () => {
        const onSubmit = jest.fn()

        mockedServer
            .onPost('/api/revenue-addon-bundle/install/')
            .reply(200, convertBundleActionResponse)

        const { result } = renderHook(
            () =>
                useInstallBundle(
                    1,
                    BundleInstallationMethod.OneClick,
                    onSubmit,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        const { installBundle } = result.current

        expect(installBundle).toBeInstanceOf(Function)

        await installBundle()

        expect(notifyMock).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Bundle installed successfully',
        })
        expect(onSubmit).toHaveBeenCalledWith(convertBundleActionResponse)
        expect(dispatch).toHaveBeenCalled()
    })

    test('should handle error correctly', async () => {
        const onSubmit = jest.fn()

        mockedServer
            .onPost('/api/revenue-addon-bundle/install/')
            .reply(400, convertBundleActionResponse)

        const { result } = renderHook(
            () =>
                useInstallBundle(
                    1,
                    BundleInstallationMethod.OneClick,
                    onSubmit,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        const { installBundle } = result.current

        await installBundle()

        expect(onSubmit).not.toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()

        expect(notifyMock).toHaveBeenCalledWith({
            buttons: [],
            closeOnNext: true,
            message: "We couldn't install the bundle. Please try again.",
            noAutoDismiss: true,
            status: NotificationStatus.Error,
            style: NotificationStyle.Alert,
        })
    })
})
