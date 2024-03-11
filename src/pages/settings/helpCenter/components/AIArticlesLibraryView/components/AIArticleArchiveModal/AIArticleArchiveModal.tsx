import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react'

import {AIArticle} from 'models/helpCenter/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Label from 'pages/common/forms/Label/Label'
import TextArea from 'pages/common/forms/TextArea'

import css from './AIArticleArchiveModal.less'

export enum ArchiveReason {
    AlreadyExists = 'This topic already exists in my Help Center',
    NotInterested = 'I’m not interested in this article',
    Other = 'Other',
}

const archiveReasonMaxLength = 5000

const archiveReasonOptions = Object.values(ArchiveReason).map((value) => ({
    value,
    label: value,
}))

export type AIArticleArchiveModalHandle = {
    open: (article: AIArticle) => void
}

type Props = {
    onArchive: (article: AIArticle, reason?: string) => void
}

const AIArticleArchiveModal = forwardRef<AIArticleArchiveModalHandle, Props>(
    ({onArchive: onArchiveProp}, ref) => {
        const [articleToArchive, setArticleToArchive] = useState<AIArticle>()
        const [reason, setReason] = useState<ArchiveReason>()
        const [reasonComment, setReasonComment] = useState<string>()
        const reasonCommentRef = useRef<HTMLTextAreaElement>(null)

        useImperativeHandle(
            ref,
            () => ({
                open: (article: AIArticle) => {
                    setArticleToArchive(article)
                    setReason(undefined)
                    setReasonComment(undefined)
                },
            }),
            []
        )

        const onReasonChange = (reason: ArchiveReason) => {
            setReason(reason)

            if (reason === ArchiveReason.Other) {
                setTimeout(() => {
                    reasonCommentRef.current?.focus()
                }, 0)
            }
        }

        const onArchive = () => {
            const reasonValue =
                reason === ArchiveReason.Other ? reasonComment : reason

            articleToArchive && onArchiveProp(articleToArchive, reasonValue)
            setArticleToArchive(undefined)
        }
        const onClose = () => {
            setArticleToArchive(undefined)
        }

        return (
            <Modal isOpen={!!articleToArchive} isClosable onClose={onClose}>
                <ModalHeader title="Archive article" />
                <ModalBody>
                    <div className={css.formGroup}>
                        <div className={css.formGroup}>
                            <Label>
                                Select a reason for archiving the article:
                            </Label>
                            <SelectField
                                fullWidth
                                value={reason}
                                placeholder="Select a reason..."
                                onChange={(value) =>
                                    onReasonChange(value as ArchiveReason)
                                }
                                options={archiveReasonOptions}
                                showSelectedOption
                            />
                        </div>
                        <div
                            style={{
                                display:
                                    reason === ArchiveReason.Other
                                        ? 'block'
                                        : 'none',
                            }}
                        >
                            <TextArea
                                ref={reasonCommentRef}
                                placeholder="Type your reason here..."
                                rows={3}
                                value={reasonComment}
                                onChange={(value) =>
                                    setReasonComment(
                                        value.slice(0, archiveReasonMaxLength)
                                    )
                                }
                                caption={`${
                                    reasonComment?.length || 0
                                }/${archiveReasonMaxLength} characters`}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onArchive}
                        isDisabled={reason === undefined}
                    >
                        Archive
                    </Button>
                </ModalActionsFooter>
            </Modal>
        )
    }
)

export default AIArticleArchiveModal
