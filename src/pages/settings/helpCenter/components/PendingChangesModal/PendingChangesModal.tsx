import {UnregisterCallback} from 'history'
import React, {useEffect, useRef, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {CloseModal} from '../articles/CloseModal'

type PendingChangesModalProps = {
    when: boolean
    message?: string
    show?: boolean
    onDiscard?: () => void
    onContinueEditing?: () => void
    onSave: () => Promise<void>
}

const PendingChangesModal = ({
    when,
    message = `Your changes to this page will be lost if you don't save them.`,
    show = false,
    onContinueEditing,
    onDiscard,
    onSave,
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
                return false
            }
        })
        return () => {
            unblockRef.current && unblockRef.current()
        }
    }, [when, history])

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
            title={<b>Save changes?</b>}
            saveText="Save Changes"
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
