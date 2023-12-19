import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {CREATE_AGENT_SUCCESS} from 'state/agents/constants'
import {
    agentsKeys,
    useCreateAgent as usePureCreateAgent,
} from 'models/agents/queries'
import {agents} from 'fixtures/agents'
import {assumeMock} from 'utils/testing'

import {handleError} from '../errorHandler'
import {useCreateAgent} from '../useCreateAgent'

const queryClient = mockQueryClient()

jest.mock('models/agents/queries')
const usePureCreateAgentMock = assumeMock(usePureCreateAgent)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useCreateAgent', () => {
    beforeEach(() => {
        usePureCreateAgentMock.mockClear()
    })

    it('should dispatch success notification on success and invalidate lists queries', () => {
        const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')
        renderHook(() => useCreateAgent(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        usePureCreateAgentMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(agents[0]),
            [agents[0]],
            undefined
        )

        expect(invalidateQueryMock).toHaveBeenLastCalledWith({
            queryKey: agentsKeys.all(),
        })

        expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
            type: CREATE_AGENT_SUCCESS,
            resp: agents[0],
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: `Team member created. We've sent login instructions to ${agents[0].email}.`,
            status: NotificationStatus.Success,
        })

        expect(mockedDispatch).toHaveBeenCalledTimes(2)
    })

    it('should call handleError on error', () => {
        renderHook(() => useCreateAgent(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
        const myError = {}
        usePureCreateAgentMock.mock.calls[0][0]?.onError!(
            myError,
            [agents[0]],
            undefined
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            myError,
            'Failed to create team member',
            mockedDispatch
        )
    })
})
