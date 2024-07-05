import React, {MouseEvent} from 'react'
import {Tooltip} from '@gorgias/ui-kit'

import SortableAccordionHeader from 'pages/common/components/accordion/SortableAccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {useAccordionItemContext} from 'pages/common/components/accordion/AccordionItemContext'
import EmptyResponseMessageContentError from 'pages/automate/common/components/EmptyResponseMessageContentError'

import {useQuickResponsesViewContext} from '../QuickResponsesViewContext'
import {
    FLOWS,
    MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS,
    QUICK_RESPONSES,
} from '../../common/components/constants'
import QuickResponseResponseMessageContent from './QuickResponseResponseMessageContent'
import QuickResponseTitle from './QuickResponseTitle'

import css from './QuickResponsesAccordionItem.less'

type Props = {
    item: QuickResponsePolicy
    onPreviewChange: (nextItem: QuickResponsePolicy) => void
    onDelete: (id: QuickResponsePolicy['id']) => void
    onToggle: (
        id: QuickResponsePolicy['id'],
        deactivatedDatetime: QuickResponsePolicy['deactivated_datetime']
    ) => void
}

const QuickResponsesAccordionItem = ({
    item,
    onPreviewChange,
    onDelete,
    onToggle,
}: Props) => {
    const {isUpdatePending, isDisabled, hasError, isLimitReached} =
        useQuickResponsesViewContext()
    const {isExpanded} = useAccordionItemContext()

    const toggleInputId = `toggle-input-${item.id}`

    const handleToggleStopPropagation = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation()
    }
    const handleToggle = (nextValue: boolean) => {
        const deactivatedDatetime = nextValue ? null : new Date().toISOString()

        onToggle(item.id, deactivatedDatetime)
    }
    const handleTitleChange = (nextTitle: string) => {
        onPreviewChange({
            ...item,
            title: nextTitle,
        })
    }
    const handleResponseMessageContentChange = (
        responseMessageContent: QuickResponsePolicy['response_message_content']
    ) => {
        onPreviewChange({
            ...item,
            response_message_content: responseMessageContent,
        })
    }
    const handleDelete = () => {
        onDelete(item.id)
    }

    const isUpdatePendingOrHasError = isUpdatePending || hasError
    const isDeactivated = Boolean(item.deactivated_datetime)
    const isEmpty =
        !item.response_message_content.text &&
        !item.response_message_content.html &&
        item.response_message_content.attachments.isEmpty()

    return (
        <>
            <SortableAccordionHeader>
                <div
                    id={toggleInputId}
                    data-testid="quick-response-toggle"
                    onClick={handleToggleStopPropagation}
                >
                    <ToggleInput
                        isDisabled={
                            isDisabled ||
                            isUpdatePendingOrHasError ||
                            (isLimitReached && isDeactivated)
                        }
                        isToggled={!item.deactivated_datetime}
                        onClick={handleToggle}
                    />
                </div>
                {!isUpdatePendingOrHasError && isLimitReached && isDeactivated && (
                    <Tooltip
                        placement="top"
                        target={toggleInputId}
                        trigger={['hover']}
                    >
                        There are already {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS}{' '}
                        active {QUICK_RESPONSES} and/or {FLOWS}. Disable one of
                        them to activate this one.
                    </Tooltip>
                )}
                <QuickResponseTitle
                    title={item.title}
                    onChange={handleTitleChange}
                />
                {isEmpty && !isExpanded && <EmptyResponseMessageContentError />}
            </SortableAccordionHeader>
            <AccordionBody>
                <QuickResponseResponseMessageContent
                    responseMessageContent={item.response_message_content}
                    onChange={handleResponseMessageContentChange}
                />
                <div className={css.deleteButtonContainer}>
                    <ConfirmButton
                        confirmationButtonIntent="destructive"
                        confirmationContent="Deleting this quick response cannot be undone."
                        confirmationTitle={<b>Delete quick response?</b>}
                        confirmLabel="Delete"
                        fillStyle="ghost"
                        intent="destructive"
                        onConfirm={handleDelete}
                        placement="top"
                        showCancelButton
                        isDisabled={isUpdatePending}
                    >
                        <ButtonIconLabel icon="delete">Delete</ButtonIconLabel>
                    </ConfirmButton>
                </div>
            </AccordionBody>
        </>
    )
}

export default QuickResponsesAccordionItem
