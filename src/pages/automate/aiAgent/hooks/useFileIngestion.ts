import {useQueryClient} from '@tanstack/react-query'
import {useCallback, useEffect, useState} from 'react'

import {
    helpCenterKeys,
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetFileIngestion,
} from 'models/helpCenter/queries'
import {Components} from 'rest_api/help_center_api/client.generated'

const UPDATE_STATUS_INTERVAL_MS = 5000

export const useFileIngestion = ({
    helpCenterId,
    onSuccess,
    onFailure,
}: {
    helpCenterId: number
    onSuccess?: () => void
    onFailure?: () => void
}): {
    ingestFile: (
        createFileIngestionLogDto: Components.Schemas.CreateFileIngestionLogDto
    ) => Promise<void>
    ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] | null
    deleteIngestedFile: (ingestedFileId: number) => Promise<void>
    isIngesting: boolean
} => {
    const queryClient = useQueryClient()
    const [ingestingFileId, setIngestingFileId] = useState<number | null>(null)

    const invalidateQueries = useCallback(
        () =>
            queryClient.invalidateQueries({
                queryKey: helpCenterKeys.fileIngestions(helpCenterId),
            }),
        [helpCenterId, queryClient]
    )

    const {mutateAsync: createFileIngestionAsync} = useCreateFileIngestion({
        onSuccess: invalidateQueries,
    })

    const {data: ingestedFiles} = useGetFileIngestion(
        {
            help_center_id: helpCenterId,
        },
        {
            refetchOnWindowFocus: false,
            refetchInterval:
                ingestingFileId === null ? false : UPDATE_STATUS_INTERVAL_MS,
        }
    )

    const {mutateAsync: deleteFileIngestionAsync} = useDeleteFileIngestion({
        onSuccess: invalidateQueries,
    })

    const ingestFile = async (
        createFileIngestionLogDto: Components.Schemas.CreateFileIngestionLogDto
    ) => {
        const resp = await createFileIngestionAsync([
            undefined,
            {help_center_id: helpCenterId},
            createFileIngestionLogDto,
        ])

        setIngestingFileId(resp?.data.id ?? null)
    }

    const deleteIngestedFile = async (ingestedFileId: number) => {
        await deleteFileIngestionAsync([
            undefined,
            {help_center_id: helpCenterId, file_ingestion_id: ingestedFileId},
        ]).finally(() => invalidateQueries())
    }

    useEffect(() => {
        if (ingestingFileId === null || !ingestedFiles) return

        const ingestingFile = ingestedFiles.data.find(
            (x) => x.id === ingestingFileId
        )

        if (!ingestingFile || ingestingFile.status === 'PENDING') return

        if (ingestingFile.status === 'FAILED') {
            onFailure && onFailure()
        }

        if (ingestingFile.status === 'SUCCESSFUL') {
            onSuccess && onSuccess()
        }

        setIngestingFileId(null)
        void invalidateQueries()
    }, [
        ingestedFiles,
        ingestingFileId,
        invalidateQueries,
        onFailure,
        onSuccess,
    ])

    return {
        ingestFile,
        ingestedFiles: ingestedFiles ? ingestedFiles.data : null,
        deleteIngestedFile,
        isIngesting: ingestingFileId !== null,
    }
}
