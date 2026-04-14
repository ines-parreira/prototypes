import { useEffect, useRef, useState } from 'react'

import { Box, Button, Heading, Size } from '@gorgias/axiom'

import {
    DeleteSegmentConfirmation,
    SegmentsSidePanel,
    SegmentsTable,
} from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'
import { useDeleteSegment, useSegments } from 'AIJourney/queries'
import { useConditionsMetadata } from 'AIJourney/queries/useConditionsMetadata/useConditionsMetadata'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './Segments.less'

export type Segment = {
    id: string
    name: string
    conditions: string
    count?: number
    created_datetime: string
    updated_datetime: string
}

export const Segments = () => {
    const selectedSegmentRef = useRef<Segment | undefined>(undefined)
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [segmentToDelete, setSegmentToDelete] = useState<Segment | undefined>(
        undefined,
    )
    const [cursor, setCursor] = useState<string | undefined>(undefined)
    const [pageSize, setPageSize] = useState(10)
    const { currentIntegration } = useJourneyContext()
    const { mutate: deleteSegment } = useDeleteSegment()
    const { data: segmentsData, isLoading } = useSegments(
        currentIntegration?.id,
        {
            limit: pageSize,
            cursor,
        },
    )
    const dispatch = useAppDispatch()
    const {
        data: schema,
        isLoading: isSchemaLoading,
        isError: isSchemaError,
    } = useConditionsMetadata()

    useEffect(() => {
        if (isSchemaError) {
            dispatch(
                notify({
                    message:
                        'Failed to load segment conditions. Please refresh the page.',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [isSchemaError, dispatch])

    const hasNextPage = !!segmentsData?.metadata.next_cursor
    const hasPrevPage = !!segmentsData?.metadata.prev_cursor

    const openSidePanel = (segment: Segment) => {
        selectedSegmentRef.current = segment
        setIsSidePanelOpen(true)
    }

    const handleClose = () => {
        setIsSidePanelOpen(false)
    }

    const handleDuplicateClick = (segment: Segment) => {
        openSidePanel({ ...segment, name: `${segment.name} (copy)` })
    }

    return (
        <Box className={css.container}>
            <Box m={Size.Lg} flexDirection="column">
                <Box alignItems="center" justifyContent="space-between">
                    <Heading size="xl">Segments</Heading>
                    <Button
                        variant="secondary"
                        leadingSlot="cloud"
                        isDisabled={isSchemaLoading || isSchemaError}
                        onClick={() => {
                            selectedSegmentRef.current = undefined
                            setIsSidePanelOpen(true)
                        }}
                    >
                        Create segment
                    </Button>
                </Box>
            </Box>
            <SegmentsTable
                data={segmentsData?.data ?? []}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                pageSize={pageSize}
                onNextPage={() =>
                    setCursor(segmentsData?.metadata.next_cursor ?? undefined)
                }
                onPrevPage={() =>
                    setCursor(segmentsData?.metadata.prev_cursor ?? undefined)
                }
                onPageSizeChange={(size) => {
                    setCursor(undefined)
                    setPageSize(size)
                }}
                onSegmentClick={openSidePanel}
                onEditClick={openSidePanel}
                onDuplicateClick={handleDuplicateClick}
                onDeleteClick={(segment) => setSegmentToDelete(segment)}
            />
            <DeleteSegmentConfirmation
                isOpen={!!segmentToDelete}
                onClose={() => setSegmentToDelete(undefined)}
                onConfirm={() => {
                    if (segmentToDelete) {
                        deleteSegment({ segmentId: segmentToDelete.id })
                    }
                    setSegmentToDelete(undefined)
                }}
            />
            {schema && (
                <SegmentsSidePanel
                    isOpen={isSidePanelOpen}
                    onClose={handleClose}
                    segment={selectedSegmentRef.current}
                    schema={schema}
                />
            )}
        </Box>
    )
}
