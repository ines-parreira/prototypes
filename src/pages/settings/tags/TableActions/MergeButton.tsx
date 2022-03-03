import React, {useCallback, useState} from 'react'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import {List, Map} from 'immutable'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

export type Props = {
    selectedNum: number
    tags: List<any>
    meta: Map<any, any>
    onMerge: () => void
    disabled: boolean
}

const MergeButton = ({selectedNum, tags, meta, onMerge, disabled}: Props) => {
    const [askMergeConfirmation, setAskMergeConfirmation] = useState(false)
    const [mergeTagDestination, setMergeTagDestination] = useState('')

    const toggleMergeConfirmation = useCallback(() => {
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
                isDisabled={disabled}
                intent={ButtonIntent.Secondary}
                className="mr-2 skip-default"
                onClick={toggleMergeConfirmation}
            >
                <ButtonIconLabel icon="call_merge">Merge</ButtonIconLabel>
            </Button>
            <Popover
                placement="bottom"
                isOpen={askMergeConfirmation}
                target="bulk-merge-button"
                toggle={toggleMergeConfirmation}
                trigger="legacy"
            >
                <PopoverHeader>Are you sure?</PopoverHeader>
                <PopoverBody>
                    <p>
                        You are about to merge {selectedNum} tags into{' '}
                        <b>{mergeTagDestination}</b>.<br />
                        <b>This action cannot be undone</b>.
                    </p>
                    <Button onClick={handleMergeClick}>Confirm</Button>
                </PopoverBody>
            </Popover>
        </>
    )
}

export default MergeButton
