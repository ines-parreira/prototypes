import { useCallback } from 'react'

import {
    Box,
    Button,
    Heading,
    SidePanel,
    SidePanelSize,
    Size,
    TextField,
} from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

export const SegmentsSidePanel = ({
    isOpen,
    onClose,
    segment,
}: {
    isOpen: boolean
    onClose: () => void
    segment?: Segment
}) => {
    const handleCancel = useCallback(() => {
        onClose()
    }, [onClose])

    const isEditing = segment !== undefined

    return (
        <SidePanel
            size={SidePanelSize.Xl}
            onOpenChange={handleCancel}
            isOpen={isOpen}
            withoutPadding
        >
            <Box flexDirection="column" padding={Size.Md} paddingTop={Size.Lg}>
                <Heading size="xl">
                    {isEditing ? 'Edit segment' : 'Create new segment'}
                </Heading>

                <Box marginTop={Size.Md} flexDirection="column" gap={Size.Lg}>
                    <TextField
                        label="Segment name"
                        isRequired
                        value={segment?.name ?? ''}
                    />
                    <Box gap={Size.Xs} justifyContent="flex-end">
                        <Button
                            variant="tertiary"
                            onClick={() => handleCancel()}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => onClose()}>Save segment</Button>
                    </Box>
                </Box>
            </Box>
        </SidePanel>
    )
}
