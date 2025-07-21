import { useCallback, useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    helpCenterKeys,
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetFileIngestion,
} from 'models/helpCenter/queries'
import { Components } from 'rest_api/help_center_api/client.generated'

const UPDATE_STATUS_INTERVAL_MS = 5000

export const useFileIngestion = ({
    helpCenterId,
    ingestedFileIds,
    onSuccess,
    onFailure,
    queryOptionsOverrides,
}: {
    helpCenterId: number
    ingestedFileIds?: number[]
    onSuccess?: (dto: Components.Schemas.RetrieveFileIngestionLogDto) => void
    onFailure?: (dto: Components.Schemas.RetrieveFileIngestionLogDto) => void
    queryOptionsOverrides?: Parameters<typeof useGetFileIngestion>[1]
}): {
    ingestFile: (
        createFileIngestionLogDto: Components.Schemas.CreateFileIngestionLogDto,
    ) => Promise<void>
    ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] | null
    deleteIngestedFile: (ingestedFileId: number) => Promise<void>
    isIngesting: boolean
    isLoading: boolean
} => {
    const queryClient = useQueryClient()
    const [ingestingFilesId, setIngestingFilesId] = useState<number[] | null>(
        [],
    )

    const invalidateQueries = useCallback(
        () =>
            queryClient.invalidateQueries({
                queryKey: helpCenterKeys.fileIngestions(helpCenterId),
            }),
        [helpCenterId, queryClient],
    )

    const { mutateAsync: createFileIngestionAsync } = useCreateFileIngestion({
        onSuccess: invalidateQueries,
    })

    const { data: ingestedFiles, isLoading } = useGetFileIngestion(
        {
            help_center_id: helpCenterId,
            ids: ingestedFileIds,
        },
        {
            ...queryOptionsOverrides,
            enabled: !!helpCenterId,
            refetchOnWindowFocus: false,
            refetchInterval:
                ingestingFilesId === null ? false : UPDATE_STATUS_INTERVAL_MS,
        },
    )

    const { mutateAsync: deleteFileIngestionAsync } = useDeleteFileIngestion({
        onSuccess: invalidateQueries,
    })

    const ingestFile = async (
        createFileIngestionLogDto: Components.Schemas.CreateFileIngestionLogDto,
    ) => {
        const resp = await createFileIngestionAsync([
            undefined,
            { help_center_id: helpCenterId },
            createFileIngestionLogDto,
        ])

        setIngestingFilesId((prev) => {
            const id = resp?.data.id
            if (!id) return prev
            if (prev === null) return [id]
            return [...prev, id]
        })
    }

    const deleteIngestedFile = async (ingestedFileId: number) => {
        await deleteFileIngestionAsync([
            undefined,
            { help_center_id: helpCenterId, file_ingestion_id: ingestedFileId },
        ]).finally(() => invalidateQueries())
    }

    useEffect(() => {
        function checkIfFileIngestionIsFinished(
            ingestingFileId: number | null,
        ) {
            if (ingestingFileId === null || !ingestedFiles) return

            const ingestingFile = ingestedFiles.data.find(
                (x) => x.id === ingestingFileId,
            )

            if (!ingestingFile || ingestingFile.status === 'PENDING') return

            if (ingestingFile.status === 'FAILED') {
                onFailure && onFailure(ingestingFile)
            }

            if (ingestingFile.status === 'SUCCESSFUL') {
                onSuccess && onSuccess(ingestingFile)
            }

            setIngestingFilesId((prev) => {
                if (!prev) return null
                return prev.filter((id) => id !== ingestingFileId)
            })
            void invalidateQueries()
        }

        for (const id of ingestingFilesId ?? []) {
            checkIfFileIngestionIsFinished(id)
        }
    }, [
        ingestedFiles,
        ingestingFilesId,
        invalidateQueries,
        onFailure,
        onSuccess,
    ])

    return {
        ingestFile,
        ingestedFiles: ingestedFiles ? ingestedFiles.data : null,
        deleteIngestedFile,
        isIngesting: ingestingFilesId !== null && ingestingFilesId.length > 0,
        isLoading,
    }
}
