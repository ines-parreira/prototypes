import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import ReplyButtonItem from './ReplyButtonItem'

import css from './ReplyButtonList.less'

type ReplyButtonListProps = {
    nodeId: string
    choices: {event_id: string; label: string}[]
    onReorderChoices: (orderedEventIds: string[]) => void
    onChangeChoiceLabel: (event_id: string, label: string) => void
    onAddChoice: () => void
}

export default function ReplyButtonList({
    nodeId,
    choices,
    onReorderChoices,
    onChangeChoiceLabel,
    onAddChoice,
}: ReplyButtonListProps) {
    const {dispatch} = useWorkflowEditorContext()
    const [choicesDirty, setChoicesDirty] = useState(choices)

    const handleMove = (dragIndex: number, hoverIndex: number) => {
        const nextChoices = [...choicesDirty]
        const dragChoice = nextChoices[dragIndex]
        nextChoices.splice(dragIndex, 1)
        nextChoices.splice(hoverIndex, 0, dragChoice)
        setChoicesDirty(nextChoices)
    }

    const handleDrop = () => {
        onReorderChoices(choicesDirty.map(({event_id}) => event_id))
    }

    const handleCancel = () => {
        setChoicesDirty(choices)
    }

    useEffect(() => {
        setChoicesDirty(choices)
    }, [choices])

    const handleDeleteChoiceClick = (index: number) => {
        dispatch({
            type: 'GREY_OUT_CHOICE_CHILDREN',
            multipleChoicesNodeId: nodeId,
            eventId: choicesDirty[index].event_id,
            isGreyedOut: true,
        })
    }
    const handleDeleteChoiceCancel = (index: number) => {
        dispatch({
            type: 'GREY_OUT_CHOICE_CHILDREN',
            multipleChoicesNodeId: nodeId,
            eventId: choicesDirty[index].event_id,
            isGreyedOut: false,
        })
    }
    const handleDeleteChoiceConfirmation = (index: number) => {
        const choice = choicesDirty[index]
        dispatch({
            type: 'DELETE_MULTIPLE_CHOICES_CHOICE',
            nodeId: nodeId,
            eventId: choice.event_id,
        })
    }

    const handleChangeChoiceLabel = (event_id: string, label: string) => {
        setChoicesDirty((choicesDirty) =>
            choicesDirty.map((choice) =>
                choice.event_id === event_id ? {...choice, label} : choice
            )
        )
        onChangeChoiceLabel(event_id, label)
    }

    return (
        <div className={css.container} key="ReplyButtonList">
            {choicesDirty.map(({event_id, label}, index) => (
                <ReplyButtonItem
                    key={event_id}
                    index={index}
                    onMove={handleMove}
                    onDrop={handleDrop}
                    onCancel={handleCancel}
                    eventId={event_id}
                    label={label}
                    placeholder={`Option ${index + 1}`}
                    onChangeLabel={(nextLabel) => {
                        handleChangeChoiceLabel(event_id, nextLabel)
                    }}
                    disabledTooltip={
                        choicesDirty.length === 1
                            ? 'At least one answer is required'
                            : undefined
                    }
                    onDeleteChoiceClick={handleDeleteChoiceClick}
                    onDeleteChoiceCancel={handleDeleteChoiceCancel}
                    onDeleteChoiceConfirmation={handleDeleteChoiceConfirmation}
                />
            ))}
            <div>
                <Button
                    onKeyDown={(e) => {
                        e.preventDefault()
                    }}
                    intent="secondary"
                    onClick={() => onAddChoice()}
                    isDisabled={choicesDirty.length >= 6}
                >
                    <ButtonIconLabel icon="add">Add option</ButtonIconLabel>
                </Button>
            </div>
        </div>
    )
}
