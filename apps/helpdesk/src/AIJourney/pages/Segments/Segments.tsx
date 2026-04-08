import { useRef, useState } from 'react'

import { Box, Button, Heading, Size } from '@gorgias/axiom'

import { SegmentsSidePanel, SegmentsTable } from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'
import { useSegments } from 'AIJourney/queries'

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
    const [cursor, setCursor] = useState<string | undefined>(undefined)
    const [pageSize, setPageSize] = useState(10)
    const { currentIntegration } = useJourneyContext()
    const { data: segmentsData, isLoading } = useSegments(
        currentIntegration?.id,
        {
            limit: pageSize,
            cursor,
        },
    )

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
                onDeleteClick={() => {}}
            />
            <SegmentsSidePanel
                isOpen={isSidePanelOpen}
                onClose={handleClose}
                segment={selectedSegmentRef.current}
            />
        </Box>
    )
}
