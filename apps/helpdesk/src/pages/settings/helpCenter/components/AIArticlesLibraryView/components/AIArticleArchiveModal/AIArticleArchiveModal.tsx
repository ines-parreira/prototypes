import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import { AIArticle } from 'models/helpCenter/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
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
    ({ onArchive: onArchiveProp }, ref) => {
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
            [],
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
                            <Label htmlFor="archiveReason">
                                Select a reason for archiving the article:
                            </Label>
                            <SelectField
                                id="archiveReason"
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
                                innerClassName={css.reasonComment}
                                ref={reasonCommentRef}
                                placeholder="Type your reason here..."
                                autoRowHeight
                                value={reasonComment}
                                onChange={(value) =>
                                    setReasonComment(
                                        value.slice(0, archiveReasonMaxLength),
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
    },
)

export default AIArticleArchiveModal
