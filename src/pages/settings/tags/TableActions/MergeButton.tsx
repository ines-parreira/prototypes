import React, {useCallback, useState} from 'react'
import {List, Map} from 'immutable'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

export type Props = {
    selectedNum: number
    tags: List<any>
    meta: Map<any, any>
    onMerge: () => void
    disabled: boolean
}

const MergeButton = ({selectedNum, tags, meta, onMerge, disabled}: Props) => {
    const [mergeTagDestination, setMergeTagDestination] = useState('')

    const handleMergeConfirmation = useCallback(() => {
        const destID = meta
            .filter((meta: Map<any, any>) => meta.get('selected') as boolean)
            .keySeq()
            .toList()
            .last() as number
        const destName = (
            tags
                .filter(
                    (meta: Map<any, any>) =>
                        (meta.get('id') as number).toString() ===
                        destID.toString()
                )
                .first() as Map<any, any>
        ).get('name', '')
        setMergeTagDestination(destName)
    }, [tags, meta])

    const handleMergeClick = useCallback(() => {
        setMergeTagDestination('')
        onMerge()
    }, [onMerge])

    return (
        <ConfirmationPopover
            content={
                <>
                    You are about to merge {selectedNum} tags into{' '}
                    <b>{mergeTagDestination}</b>.<br />
                    <b>This action cannot be undone</b>.
                </>
            }
            id="bulk-merge-button"
            onConfirm={handleMergeClick}
        >
            {({uid, onDisplayConfirmation}) => (
                <Button
                    id={uid}
                    isDisabled={disabled}
                    intent="secondary"
                    className="mr-2 skip-default"
                    onClick={(event) => {
                        handleMergeConfirmation()
                        onDisplayConfirmation(event)
                    }}
                >
                    <ButtonIconLabel icon="call_merge">Merge</ButtonIconLabel>
                </Button>
            )}
        </ConfirmationPopover>
    )
}

export default MergeButton
