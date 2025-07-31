import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import {
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetFileIngestion,
} from 'models/helpCenter/queries'

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
const mockGetFileIngestion = jest.mocked(useGetFileIngestion)

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

    it('should handle successful file ingestion and update state correctly', async () => {
        const { result, rerender } = renderUseFileIngestion()

        await act(async () => {
            await result.current.ingestFile({
                filename: 'test.pdf',
                type: 'pdf',
                size_bytes: 1000,
                google_storage_url: 'https://test.com/test.pdf',
            })
        })

        // First update with PENDING status
        mockGetFileIngestion.mockReturnValue({
            data: {
                data: [{ id: 5, status: 'PENDING' }],
            },
        } as unknown as ReturnType<typeof useGetFileIngestion>)
        rerender()

        // Then update with SUCCESSFUL status
        mockGetFileIngestion.mockReturnValue({
            data: {
                data: [{ id: 5, status: 'SUCCESSFUL' }],
            },
        } as unknown as ReturnType<typeof useGetFileIngestion>)
        rerender()

        expect(mockOnSuccess).toHaveBeenCalledWith(
            expect.objectContaining({ id: 5, status: 'SUCCESSFUL' }),
        )
        expect(result.current.isIngesting).toBe(false)
    })

    it('should not check file ingestion if ingestedFiles is null', () => {
        // Arrange: ingestedFiles is null, ingestingFilesId has an id
        mockGetFileIngestion.mockReturnValue({
            data: null,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetFileIngestion>)
        const { result, rerender } = renderUseFileIngestion()
        // Simulate ingesting file
        act(() => {
            result.current.ingestFile({
                filename: 'file.pdf',
                type: 'pdf',
                size_bytes: 123,
                google_storage_url: 'https://test.com/file.pdf',
            })
        })
        // Set ingestedFiles to null and rerender
        mockGetFileIngestion.mockReturnValue({
            data: null,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetFileIngestion>)
        rerender()
        // No onSuccess or onFailure should be called
        expect(mockOnSuccess).not.toHaveBeenCalled()
        expect(mockOnFailure).not.toHaveBeenCalled()
    })

    it('should not check file ingestion if ingestingFileId is null', () => {
        // Arrange: ingestedFiles has data, but ingestingFilesId is null
        mockGetFileIngestion.mockReturnValue({
            data: {
                data: [{ id: 5, status: 'SUCCESSFUL' }],
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetFileIngestion>)

        // Mock the useState to return null for ingestingFilesId
        const mockSetState = jest.fn()
        jest.spyOn(React, 'useState').mockImplementationOnce(() => [
            null,
            mockSetState,
        ])

        renderUseFileIngestion()

        // Verify that no callbacks are triggered even with successful file data
        expect(mockOnSuccess).not.toHaveBeenCalled()
        expect(mockOnFailure).not.toHaveBeenCalled()
        expect(mockSetState).not.toHaveBeenCalled()
    })
})
