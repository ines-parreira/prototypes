import React, {useCallback, useState} from 'react'
import {Button, Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import type {List, Map} from 'immutable'

export type Props = {
    selectedNum: number,
    tags: List<*>,
    meta: Map<*, *>,
    onMerge: () => any,
    disabled: boolean,
}

const MergeButton = ({selectedNum, tags, meta, onMerge, disabled}: Props) => {
    const [askMergeConfirmation, setAskMergeConfirmation] = useState(false)
    const [mergeTagDestination, setMergeTagDestination] = useState('')

    const toggleMergeConfirmation = useCallback(() => {
        const destID = meta
            .filter((meta) => meta.get('selected'))
            .keySeq()
            .toList()
            .last()
        const destName = tags
            .filter((meta) => meta.get('id').toString() === destID.toString())
            .first()
            .get('name', '')
        setAskMergeConfirmation(!askMergeConfirmation)
        setMergeTagDestination(destName)
    }, [tags, meta, askMergeConfirmation])

    const handleMergeClick = useCallback(() => {
        setMergeTagDestination('')
        setAskMergeConfirmation(false)
        onMerge()
    }, [onMerge])

    return (
        <>
            <Button
                id="bulk-merge-button"
                disabled={disabled}
                size="sm"
                color="secondary"
                type="button"
                className="mr-2"
                onClick={toggleMergeConfirmation}
            >
                <i className="material-icons mr-2">call_merge</i>
                Merge
            </Button>
            <Popover
                placement="bottom"
                isOpen={askMergeConfirmation}
                target="bulk-merge-button"
                toggle={toggleMergeConfirmation}
            >
                <PopoverHeader>Are you sure?</PopoverHeader>
                <PopoverBody>
                    <p>
                        You are about to merge {selectedNum} tags into{' '}
                        <b>{mergeTagDestination}</b>.<br />
                        <b>This action cannot be undone</b>.
                    </p>
                    <Button
                        type="submit"
                        color="success"
                        onClick={handleMergeClick}
                    >
                        Confirm
                    </Button>
                </PopoverBody>
            </Popover>
        </>
    )
}

export default MergeButton
