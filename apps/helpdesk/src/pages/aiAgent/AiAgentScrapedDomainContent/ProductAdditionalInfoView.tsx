import React, { useCallback, useEffect, useMemo, useState } from 'react'

import classnames from 'classnames'
import { EditorState } from 'draft-js'
import { Prompt } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateProductAdditionalInfo } from 'models/ecommerce/queries'
import {
    AdditionalInfoKey,
    AdditionalInfoObjectType,
    AdditionalInfoSourceType,
    ProductAdditionalInfo,
} from 'models/ecommerce/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import useUnsavedChangesPrompt from 'pages/common/components/useUnsavedChangesPrompt'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import RichField from 'pages/common/forms/RichField/RichField'
import { ErrorMessage } from 'pages/convert/settings/components/styled'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { contentStateFromTextOrHTML, convertToHTML } from 'utils/editor'

import css from './ProductAdditionalInfoView.less'

type Props = {
    integrationId: number
    productId: string
    initialValue?: ProductAdditionalInfo | null
}

const MAX_CHAR_COUNT = 1000

const displayedActions: ActionName[] = [
    ActionName.Bold,
    ActionName.Italic,
    ActionName.Underline,
    ActionName.BulletedList,
    ActionName.OrderedList,
]

const ProductAdditionalInfoView = ({
    integrationId,
    productId,
    initialValue,
}: Props) => {
    const dispatch = useAppDispatch()
    const [editorState, setEditorState] = useState(() => {
        if (initialValue?.rich_text) {
            const contentState = contentStateFromTextOrHTML(
                '',
                initialValue.rich_text,
            )
            return EditorState.createWithContent(contentState)
        }
        return EditorState.createEmpty()
    })
    const [isSaving, setIsSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const lastSavedContentRef = React.useRef<string>(
        initialValue?.rich_text || '',
    )

    const {
        isOpen: isNavigationModalOpen,
        onClose: closeNavigationModal,
        redirectToOriginalLocation,
        onNavigateAway,
    } = useUnsavedChangesPrompt({ when: isDirty })

    const { mutateAsync: updateAdditionalInfo } =
        useUpdateProductAdditionalInfo()

    useEffect(() => {
        let newEditorState: EditorState
        if (initialValue?.rich_text) {
            const contentState = contentStateFromTextOrHTML(
                '',
                initialValue.rich_text,
            )
            newEditorState = EditorState.createWithContent(contentState)
        } else {
            newEditorState = EditorState.createEmpty()
        }
        setEditorState(newEditorState)

        // Normalize the saved content to match what convertToHTML will produce
        // This prevents false dirty states when navigating between products
        lastSavedContentRef.current = convertToHTML(
            newEditorState.getCurrentContent(),
        )
        setIsDirty(false)
    }, [productId, initialValue])

    const currentCharCount = useMemo(() => {
        return editorState.getCurrentContent().getPlainText().length
    }, [editorState])

    const handleChange = useCallback((newEditorState: EditorState) => {
        setEditorState(newEditorState)

        // Track if content has changed from saved state
        const currentHtml = convertToHTML(newEditorState.getCurrentContent())
        const hasChanges = currentHtml !== lastSavedContentRef.current
        setIsDirty(hasChanges)
    }, [])

    const saveContent = useCallback(async () => {
        const content = editorState.getCurrentContent()
        const html = convertToHTML(content)

        setIsSaving(true)

        try {
            await updateAdditionalInfo({
                objectType: AdditionalInfoObjectType.PRODUCT,
                sourceType: AdditionalInfoSourceType.SHOPIFY,
                integrationId,
                externalId: productId,
                key: AdditionalInfoKey.AI_AGENT_EXTENDED_CONTEXT,
                data: {
                    data: {
                        rich_text: html,
                    },
                    version: new Date().toISOString(),
                },
            })

            lastSavedContentRef.current = html
            setIsDirty(false)

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Product information saved successfully.',
                    showDismissButton: true,
                }),
            )
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        "Product information couldn't be saved. Please try again.",
                    showDismissButton: true,
                }),
            )
        } finally {
            setIsSaving(false)
        }
    }, [editorState, updateAdditionalInfo, integrationId, productId, dispatch])

    const handleSave = useCallback(async () => {
        await saveContent()
    }, [saveContent])

    const handleCancel = useCallback(() => {
        setShowCancelModal(true)
    }, [])

    const handleDiscard = useCallback(() => {
        // Revert to saved content
        if (lastSavedContentRef.current) {
            const contentState = contentStateFromTextOrHTML(
                '',
                lastSavedContentRef.current,
            )
            setEditorState(EditorState.createWithContent(contentState))
        } else {
            setEditorState(EditorState.createEmpty())
        }
        setIsDirty(false)
        setShowCancelModal(false)
        closeNavigationModal()

        // If this was triggered by navigation, allow it to proceed
        redirectToOriginalLocation()
    }, [closeNavigationModal, redirectToOriginalLocation])

    const handleBackToEditing = useCallback(() => {
        setShowCancelModal(false)
        closeNavigationModal()
    }, [closeNavigationModal])

    const handleModalSaveChanges = useCallback(async () => {
        await saveContent()
        setShowCancelModal(false)
        closeNavigationModal()

        // If this was triggered by navigation, allow it to proceed after save
        if (isNavigationModalOpen) {
            redirectToOriginalLocation()
        }
    }, [
        saveContent,
        closeNavigationModal,
        isNavigationModalOpen,
        redirectToOriginalLocation,
    ])

    const [hasError, errorMessage] = useMemo(() => {
        if (currentCharCount > MAX_CHAR_COUNT) {
            return [
                true,
                `You've exceeded the ${MAX_CHAR_COUNT} character limit. Please shorten it to save your changes.`,
            ]
        }
        return [false, '']
    }, [currentCharCount])

    const isSaveDisabled = useMemo(
        () => !isDirty || isSaving || hasError,
        [isDirty, isSaving, hasError],
    )

    const isCancelDisabled = useMemo(
        () => !isDirty || isSaving,
        [isDirty, isSaving],
    )

    const modalMessage = useMemo(() => {
        if (isSaveDisabled) {
            return 'Your text exceeds the character limit. You’ll need to shorten it in order to save.'
        }
        return "Your changes to this page will be lost if you don't save them."
    }, [isSaveDisabled])

    return (
        <div className={css.container}>
            <div className={css.editorContainer}>
                <RichField
                    value={{
                        html: convertToHTML(editorState.getCurrentContent()),
                        text: editorState.getCurrentContent().getPlainText(''),
                    }}
                    onChange={handleChange}
                    minHeight={150}
                    displayedActions={displayedActions}
                    spellCheck={true}
                    allowExternalChanges={true}
                    className={classnames(css.richField, {
                        [css.onError]: hasError,
                    })}
                    maxLength={MAX_CHAR_COUNT}
                />
                {hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </div>

            <div className={css.footer}>
                <Button
                    intent="primary"
                    onClick={handleSave}
                    isDisabled={isSaveDisabled}
                    isLoading={isSaving}
                >
                    Save Changes
                </Button>
                <Button
                    intent="secondary"
                    onClick={handleCancel}
                    isDisabled={isCancelDisabled}
                >
                    Cancel
                </Button>
            </div>

            <Prompt when={isDirty} message={onNavigateAway} />

            <Modal
                isOpen={showCancelModal || isNavigationModalOpen}
                onClose={handleBackToEditing}
                isClosable={false}
            >
                <ModalHeader title="Save changes?" />
                <ModalBody className={css.modalBody}>{modalMessage}</ModalBody>
                <ModalActionsFooter
                    extra={
                        <Button
                            intent="destructive"
                            fillStyle="ghost"
                            onClick={handleDiscard}
                        >
                            Discard Changes
                        </Button>
                    }
                >
                    <Button intent="secondary" onClick={handleBackToEditing}>
                        Back To Editing
                    </Button>
                    <Button
                        intent="primary"
                        onClick={handleModalSaveChanges}
                        isLoading={isSaving}
                        isDisabled={isSaveDisabled}
                    >
                        Save Changes
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </div>
    )
}

export default ProductAdditionalInfoView
