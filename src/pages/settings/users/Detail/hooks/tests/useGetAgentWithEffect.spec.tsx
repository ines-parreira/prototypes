import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'
import {agents} from 'fixtures/agents'
import {StoreDispatch} from 'state/types'
import {useGetAgent} from 'models/agents/queries'
import {handleError} from 'hooks/agents/errorHandler'

import {useGetAgentWithEffects} from '../useGetAgentWithEffect'

jest.mock('models/agents/queries')
const useGetAgentMock = assumeMock(useGetAgent)

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

describe('useGetAgentWithEffects', () => {
    const agentId = 1
    const isEdit = true
    const setAgentState = jest.fn()
    const set2FA = jest.fn()
    const dispatch = jest.fn((fn: () => unknown) =>
        fn()
    ) as unknown as StoreDispatch

    const params = {
        agentId,
        isEdit,
        setAgentState,
        set2FA,
        dispatch,
    }

    it('should call useGetAgent with proper params and return the raw data and loading status', () => {
        useGetAgentMock.mockImplementationOnce(
            () =>
                ({
                    data: agents[0],
                    isLoading: false,
                    error: undefined,
                } as ReturnType<typeof useGetAgent>)
        )
        const {result} = renderHook(() => useGetAgentWithEffects(params))

        expect(useGetAgentMock).toHaveBeenNthCalledWith(1, 1, {enabled: isEdit})
        expect(result.current.isLoading).toBe(false)
        expect(result.current.rawData).toBe(agents[0])
    })

    it('should call handleError when getAgent returns an error', () => {
        useGetAgentMock.mockImplementationOnce(
            () =>
                ({
                    data: undefined,
                    isLoading: false,
                    error: true,
                } as ReturnType<typeof useGetAgent>)
        )
        const {result} = renderHook(() => useGetAgentWithEffects(params))

        expect(handleErrorMock).toHaveBeenCalledTimes(1)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.rawData).toBe(undefined)
    })

    it("should call `setAgentState` and `set2FA` when agent's data is fetched", () => {
        useGetAgentMock.mockImplementationOnce(
            () =>
                ({
                    data: agents[0],
                    isLoading: false,
                    error: false,
                } as ReturnType<typeof useGetAgent>)
        )
        renderHook(() => useGetAgentWithEffects(params))
        expect(setAgentState).toHaveBeenNthCalledWith(1, {
            email: agents[0].email,
            name: agents[0].name,
            role: agents[0].role.name,
        })
        expect(set2FA).toHaveBeenCalledTimes(1)
    })
})
