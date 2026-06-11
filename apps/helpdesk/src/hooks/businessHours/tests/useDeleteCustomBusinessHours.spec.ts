import { renderHook } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBusinessHoursDetails,
    mockDeleteBusinessHoursHandler,
} from '@gorgias/helpdesk-mocks'

import { useDeleteCustomBusinessHours } from '../useDeleteCustomBusinessHours'

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
        const onSuccess = jest.fn()
        const { result } = renderHook(() =>
            useDeleteCustomBusinessHours(businessHours, onSuccess),
        )
        await act(async () => {
            result.current.mutate({ id: businessHours.id })
        })

        const toastEl = await screen.findByRole('status', {
            name: `'${businessHours.name}' business hours were successfully deleted.`,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
        expect(onSuccess).toHaveBeenCalled()
    })

    it('should handle error correctly', async () => {
        const mockDeleteBusinessHoursError = mockDeleteBusinessHoursHandler(
            async () =>
                HttpResponse.json(null, {
                    status: 500,
                }),
        )
        server.use(mockDeleteBusinessHoursError.handler)

        const { result } = renderHook(() =>
            useDeleteCustomBusinessHours(businessHours),
        )

        await act(async () => {
            result.current.mutate({ id: businessHours.id })
        })

        const toastEl = await screen.findByRole('status', {
            name: "We couldn't delete your business hours. Please try again.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
