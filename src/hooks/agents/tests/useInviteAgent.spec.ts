import { renderHook } from '@testing-library/react-hooks'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { useInviteAgent as usePureInviteAgent } from 'models/agents/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { handleError } from '../errorHandler'
import { useInviteAgent } from '../useInviteAgent'

jest.mock('models/agents/queries')
const usePureInviteAgentMock = assumeMock(usePureInviteAgent)

jest.mock('../errorHandler')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('useInviteAgent', () => {
    const email = 'mr@love.com'

    beforeEach(() => {
        usePureInviteAgentMock.mockClear()
    })

    it('should accept an email param and dispatch success notification on success with this email', () => {
        renderHook(() => useInviteAgent(email))

        usePureInviteAgentMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(undefined),
            [0],
            undefined,
        )

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: `Invite has been sent to ${email}`,
            status: NotificationStatus.Success,
        })
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })

    it('should call handleError on error', () => {
        renderHook(() => useInviteAgent(email))
        const myError = {}
        usePureInviteAgentMock.mock.calls[0][0]?.onError!(
            myError,
            [0],
            undefined,
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            myError,
            'Failed to send invite',
            mockedDispatch,
        )
    })
})
