import { reportError } from '@repo/logging'
import { act, renderHook } from '@testing-library/react'

import { createJob } from 'models/job/resources'
import { JobType } from 'models/job/types'

import { useExportOpportunityTickets } from './useExportOpportunityTickets'

jest.mock('models/job/resources', () => ({
    createJob: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

describe('useExportOpportunityTickets', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(createJob as jest.Mock).mockResolvedValue({})
    })

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.isRequested).toBe(false)
    })

    it('should export tickets successfully', async () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        const ticketIds = ['123', '456', '789']

        await act(async () => {
            await result.current.exportTickets(ticketIds)
        })

        expect(createJob).toHaveBeenCalledWith({
            type: JobType.ExportTicket,
            params: {
                ticket_ids: [123, 456, 789],
            },
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.isRequested).toBe(true)
    })

    it('should handle export error', async () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        const error = new Error('Export failed')
        ;(createJob as jest.Mock).mockRejectedValue(error)

        const ticketIds = ['123']

        await act(async () => {
            await result.current.exportTickets(ticketIds)
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(true)
        expect(result.current.isRequested).toBe(true)

        expect(reportError).toHaveBeenCalledWith(error, {
            extra: {
                context: 'Export opportunity tickets',
                ticketCount: ticketIds.length,
            },
        })
    })

    it('should convert string ticket IDs to numbers', async () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        await act(async () => {
            await result.current.exportTickets(['100', '200', '300'])
        })

        expect(createJob).toHaveBeenCalledWith({
            type: JobType.ExportTicket,
            params: {
                ticket_ids: [100, 200, 300],
            },
        })
    })

    it('should reset state', async () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        await act(async () => {
            await result.current.exportTickets(['123'])
        })

        act(() => {
            result.current.resetState()
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.isRequested).toBe(false)
    })

    it('should reset state after error', async () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        ;(createJob as jest.Mock).mockRejectedValue(new Error('Test error'))

        await act(async () => {
            await result.current.exportTickets(['123'])
        })

        expect(result.current.isError).toBe(true)

        act(() => {
            result.current.resetState()
        })

        expect(result.current.isError).toBe(false)
        expect(result.current.isRequested).toBe(false)
    })

    it('should handle empty ticket IDs array', async () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        await act(async () => {
            await result.current.exportTickets([])
        })

        expect(createJob).toHaveBeenCalledWith({
            type: JobType.ExportTicket,
            params: {
                ticket_ids: [],
            },
        })
    })

    it('should handle single ticket ID', async () => {
        const { result } = renderHook(() => useExportOpportunityTickets())

        await act(async () => {
            await result.current.exportTickets(['999'])
        })

        expect(createJob).toHaveBeenCalledWith({
            type: JobType.ExportTicket,
            params: {
                ticket_ids: [999],
            },
        })
    })
})
