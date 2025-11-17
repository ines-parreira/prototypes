import React, { useCallback, useMemo } from 'react'

import type { List } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { Tag } from '@gorgias/helpdesk-queries'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

export type Props = {
    selectedTagsText: string
    tags: Record<number, Tag>
    selectedTagsIds: List<any>
    onMerge: () => void
}

const MergeButton = ({
    selectedTagsText,
    tags,
    selectedTagsIds,
    onMerge,
}: Props) => {
    const remainingTagName = useMemo(() => {
        const destID = selectedTagsIds.last() as number | null
        return destID ? tags[destID]?.name : null
    }, [selectedTagsIds, tags])

    const handleMergeClick = useCallback(() => {
        onMerge()
    }, [onMerge])

    return (
        <ConfirmationPopover
            content={
                <>
                    You are about to merge {selectedTagsIds.size - 1} tag
                    {selectedTagsIds.size > 2 && 's'} ({selectedTagsText}) into{' '}
                    <b>{remainingTagName}.</b>
                    <br />
                    <b>This action cannot be undone.</b>
                </>
            }
            onConfirm={handleMergeClick}
        >
            {({ uid, onDisplayConfirmation }) => (
                <Button
                    id={uid}
                    isDisabled={selectedTagsIds.size < 2}
                    intent="secondary"
                    className="mr-2 skip-default"
                    onClick={(event) => {
                        onDisplayConfirmation(event)
                    }}
                    leadingIcon="call_merge"
                >
                    Merge
                </Button>
            )}
        </ConfirmationPopover>
    )
}

export default MergeButton
