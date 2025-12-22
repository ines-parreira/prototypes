import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'

import type { UnregisterCallback } from 'history'
import { useHistory } from 'react-router-dom'

import { CloseModal } from '../articles/CloseModal'

type PendingChangesModalProps = {
    when: boolean
    message?: string | ReactNode
    show?: boolean
    onDiscard?: () => void
    onContinueEditing?: () => void
    onSave: () => Promise<void> | Promise<[void, void, void]>
    onShow?: () => void
    title?: string
    saveText?: string
    isSaving?: boolean
}

const PendingChangesModal = ({
    when,
    message = `Your changes to this page will be lost if you don't save them.`,
    show = false,
    onContinueEditing,
    onDiscard,
    onSave,
    onShow,
    title = 'Save changes?',
    saveText = 'Save Changes',
    isSaving = false,
}: PendingChangesModalProps) => {
    const history = useHistory()

    const [showPrompt, setShowPrompt] = useState(show)
    const [nextPath, setNextPath] = useState('')

    const unblockRef = useRef<UnregisterCallback>()

    function onCancel() {
        setShowPrompt(false)
    }

    useEffect(() => {
        unblockRef.current = history.block((location) => {
            if (when) {
                setNextPath(location.pathname)
                setShowPrompt(true)
                onShow?.()
                return false
            }
        })
        return () => {
            unblockRef.current && unblockRef.current()
        }
    }, [when, history, onShow])

    function onConfirm() {
        if (unblockRef && unblockRef.current) {
            unblockRef.current()
        }
        setShowPrompt(false)
        if (nextPath) {
            history.push(nextPath)
        }
    }

    return (
        <CloseModal
            isOpen={showPrompt || show}
            isSaving={isSaving}
            title={<b>{title}</b>}
            saveText={saveText}
            discardText="Discard Changes"
            editText="Back To Editing"
            onDiscard={() => {
                onDiscard?.()
                onConfirm()
            }}
            onContinueEditing={() => {
                onContinueEditing?.()
                onCancel()
            }}
            onSave={async () => {
                await onSave()
                onConfirm()
            }}
        >
            {message}
        </CloseModal>
    )
}

export default PendingChangesModal
