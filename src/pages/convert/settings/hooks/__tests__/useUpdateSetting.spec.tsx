import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {
    convertSettingsKeys,
    useUpdateSetting as usePureUpdateSetting,
} from 'models/convert/settings/queries'
import {channelConnection} from 'fixtures/channelConnection'
import {assumeMock} from 'utils/testing'

import {useUpdateSetting} from '../useUpdateSetting'

const queryClient = mockQueryClient()

jest.mock('models/convert/settings/queries')
const usePureUpdateSettingMock = assumeMock(usePureUpdateSetting)

describe('useUpdateSetting', () => {
    beforeEach(() => {
        usePureUpdateSettingMock.mockClear()
    })

    it('should invalidate lists queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useUpdateSetting(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        usePureUpdateSettingMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(channelConnection as any),
            [
                undefined,
                {channel_connection_id: channelConnection.id},
                channelConnection as any,
            ],
            undefined
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: convertSettingsKeys.lists(),
        })
    })
})
