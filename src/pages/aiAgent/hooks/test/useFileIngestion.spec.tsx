import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react-hooks'

import {
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetFileIngestion,
} from 'models/helpCenter/queries'
import { renderHook } from 'utils/testing/renderHook'

import { useFileIngestion } from '../useFileIngestion'

jest.mock('models/helpCenter/queries', () => ({
    helpCenterKeys: {
        fileIngestions: jest.fn(() => 'my-key'),
    },
    useCreateFileIngestion: jest.fn(),
    useDeleteFileIngestion: jest.fn(),
    useGetFileIngestion: jest.fn(),
}))

const queryClient = new QueryClient()

const mockOnSuccess = jest.fn()
const mockOnFailure = jest.fn()

const mockCreateFileIngestion = jest.fn().mockResolvedValue({
    data: { id: 5 },
})

const mockDeleteFileIngestion = jest.fn().mockResolvedValue(null)

const renderUseFileIngestion = (isLoading = false) => {
    ;(useCreateFileIngestion as jest.Mock).mockReturnValue({
        mutateAsync: mockCreateFileIngestion,
    })
    ;(useDeleteFileIngestion as jest.Mock).mockReturnValue({
        mutateAsync: mockDeleteFileIngestion,
    })
    ;(useGetFileIngestion as jest.Mock).mockReturnValue({
        data: { data: [] },
        isLoading,
    })

    return renderHook(
        () =>
            useFileIngestion({
                helpCenterId: 1,
                onSuccess: mockOnSuccess,
                onFailure: mockOnFailure,
            }),
        {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        },
    )
}

describe('useFileIngestion', () => {
    it('should initialize with default state', () => {
        const { result } = renderUseFileIngestion()

        expect(result.current.ingestedFiles).toEqual([])
        expect(result.current.isIngesting).toBe(false)
        expect(result.current.isLoading).toEqual(false)
    })

    it('should return a loading state', () => {
        const { result } = renderUseFileIngestion(true)
        expect(result.current.isLoading).toEqual(true)
    })

    it('should handle ingestFile correctly', async () => {
        const { result, rerender } = renderUseFileIngestion()

        const fileData = {
            filename: 'new-file.pdf',
            type: 'pdf',
            size_bytes: 987654,
            google_storage_url: 'https://cdn.google.com/new-file.pdf',
        }

        await act(async () => {
            await result.current.ingestFile(fileData)
        })

        expect(mockCreateFileIngestion).toHaveBeenCalledWith([
            undefined,
            { help_center_id: 1 },
            fileData,
        ])

        expect(result.current.isIngesting).toBe(true)
        ;(useGetFileIngestion as jest.Mock).mockReturnValue({
            data: {
                data: [
                    { id: 5, filename: 'new-file.pdf', status: 'SUCCESSFUL' },
                ],
            },
        })

        rerender()

        expect(mockOnSuccess).toHaveBeenCalled()
        expect(mockOnFailure).not.toHaveBeenCalled()
    })

    it('should handle ingestFile failure correctly', async () => {
        const { result, rerender } = renderUseFileIngestion()

        const fileData = {
            filename: 'new-file.pdf',
            type: 'pdf',
            size_bytes: 987654,
            google_storage_url: 'https://cdn.google.com/new-file.pdf',
        }

        await act(async () => {
            await result.current.ingestFile(fileData)
        })

        expect(mockCreateFileIngestion).toHaveBeenCalledWith([
            undefined,
            { help_center_id: 1 },
            fileData,
        ])

        expect(result.current.isIngesting).toBe(true)
        ;(useGetFileIngestion as jest.Mock).mockReturnValue({
            data: {
                data: [{ id: 5, filename: 'new-file.pdf', status: 'FAILED' }],
            },
        })

        rerender()

        expect(mockOnSuccess).not.toHaveBeenCalled()
        expect(mockOnFailure).toHaveBeenCalled()
    })

    it('should handle deleteFile correctly', async () => {
        const { result } = renderUseFileIngestion()

        await act(async () => {
            await result.current.deleteIngestedFile(5)
        })

        expect(mockDeleteFileIngestion).toHaveBeenCalledWith([
            undefined,
            { help_center_id: 1, file_ingestion_id: 5 },
        ])
    })
})
