import React, {MouseEvent} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import SortableAccordionHeader from 'pages/common/components/accordion/SortableAccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Tooltip from 'pages/common/components/Tooltip'

import {useQuickResponsesViewContext} from '../QuickResponsesViewContext'
import {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} from '../../common/components/constants'
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
    const {isUpdatePending, hasError, isLimitReached} =
        useQuickResponsesViewContext()

    const toggleInputId = `toggle-input-${item.id}`

    const handleToggle = (
        nextValue: boolean,
        event: MouseEvent<HTMLLabelElement>
    ) => {
        event.stopPropagation()

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

    const isFlowsBetaEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.FlowsBeta]

    return (
        <>
            <SortableAccordionHeader>
                <div id={toggleInputId}>
                    <ToggleInput
                        isDisabled={
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
                        {isFlowsBetaEnabled
                            ? `There are already ${MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} active quick responses and/or flows. Disable one of them to activate this one.`
                            : `There are already ${MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} active quick responses. Disable one of them to activate this one.`}
                    </Tooltip>
                )}
                <QuickResponseTitle
                    title={item.title}
                    onChange={handleTitleChange}
                />
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
