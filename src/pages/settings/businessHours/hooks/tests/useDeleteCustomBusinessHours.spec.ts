import { act } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBusinessHoursDetails,
    mockDeleteBusinessHoursHandler,
} from '@gorgias/helpdesk-mocks'

import history from 'pages/history'
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { BUSINESS_HOURS_BASE_URL } from '../../constants'
import useDeleteCustomBusinessHours from '../useDeleteCustomBusinessHours'

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

const server = setupServer()

beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

const mockDeleteBusinessHours = mockDeleteBusinessHoursHandler()

beforeEach(() => {
    server.use(mockDeleteBusinessHours.handler)
})

afterEach(() => {
    server.resetHandlers()
})

const businessHours = mockBusinessHoursDetails()

describe('useDeleteCustomBusinessHours', () => {
    it('should handle success correctly', async () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useDeleteCustomBusinessHours(businessHours),
        )
        await act(async () => {
            result.current.mutate({ id: businessHours.id })
        })

        expect(mockNotify.success).toHaveBeenCalledWith(
            `'${businessHours.name}' business hours were successfully deleted.`,
        )
        expect(history.push).toHaveBeenCalledWith(BUSINESS_HOURS_BASE_URL)
    })

    it('should handle error correctly', async () => {
        const mockDeleteBusinessHoursError = mockDeleteBusinessHoursHandler(
            async () =>
                HttpResponse.json(null, {
                    status: 500,
                }),
        )
        server.use(mockDeleteBusinessHoursError.handler)

        const { result } = renderHookWithQueryClientProvider(() =>
            useDeleteCustomBusinessHours(businessHours),
        )

        await act(async () => {
            result.current.mutate({ id: businessHours.id })
        })

        expect(mockNotify.error).toHaveBeenCalledWith(
            "We couldn't delete your business hours. Please try again.",
        )
    })
})
