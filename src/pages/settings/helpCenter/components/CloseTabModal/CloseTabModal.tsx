import {UnregisterCallback} from 'history'
import React, {useEffect, useRef, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {HELP_CENTER_CLOSE_TAB_MODAL_MESSAGE} from '../../constants'
import {CloseModal} from '../articles/CloseModal'

type ClosePromptProps = {
    when: boolean
    message?: string
    show?: boolean
    onDiscard?: () => void
    onContinueEditing?: () => void
    onSave: () => void
}

const ClosePrompt = ({
    when,
    message = HELP_CENTER_CLOSE_TAB_MODAL_MESSAGE,
    show = false,
    onContinueEditing,
    onDiscard,
    onSave,
}: ClosePromptProps) => {
    const history = useHistory()

    const [showPrompt, setShowPrompt] = useState(show)
    const [currentPath, setCurrentPath] = useState('')

    const unblockRef = useRef<UnregisterCallback>()

    function handleShowModal() {
        setShowPrompt(true)
    }

    function onCancel() {
        setShowPrompt(false)
    }

    useEffect(() => {
        unblockRef.current = history.block((location) => {
            if (when) {
                setCurrentPath(location.pathname)
                handleShowModal()
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
        history.push(currentPath)
    }

    return (
        <CloseModal
            isOpen={showPrompt}
            style={{width: '100%', maxWidth: 400}}
            title={<span>Unsaved changes</span>}
            saveText="Save"
            discardText="Discard"
            editText="Back to editing"
            onDiscard={() => {
                onDiscard?.()
                onConfirm()
            }}
            onContinueEditing={() => {
                onContinueEditing?.()
                onCancel()
            }}
            onSave={() => {
                onSave()
                onConfirm()
            }}
        >
            {message}
        </CloseModal>
    )
}

export default ClosePrompt
