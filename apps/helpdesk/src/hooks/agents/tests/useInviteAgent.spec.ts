import { assumeMock, renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { useInviteAgent as usePureInviteAgent } from 'models/agents/queries'

import { handleError } from '../errorHandler'
import { useInviteAgent } from '../useInviteAgent'

jest.mock('models/agents/queries')
const usePureInviteAgentMock = assumeMock(usePureInviteAgent)

jest.mock('../errorHandler')

describe('useInviteAgent', () => {
    const email = 'mr@love.com'

    beforeEach(() => {
        usePureInviteAgentMock.mockClear()
    })

    it('shows success toast on success with this email', async () => {
        renderHook(() => useInviteAgent(email))

        usePureInviteAgentMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(undefined),
            [0],
            undefined,
        )

        const toastEl = await screen.findByRole('status', {
            name: `Invite has been sent to ${email}`,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
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
        )
    })
})
