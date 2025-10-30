import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'
import { EditorState } from 'draft-js'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateProductAdditionalInfo } from 'models/ecommerce/queries'
import {
    AdditionalInfoKey,
    AdditionalInfoObjectType,
    AdditionalInfoSourceType,
    ProductAdditionalInfo,
} from 'models/ecommerce/types'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import RichField from 'pages/common/forms/RichField/RichField'
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
    ActionName.Emoji,
    ActionName.Link,
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
    const [isFocused, setIsFocused] = useState(false)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedContentRef = useRef<string>(initialValue?.rich_text || '')

    const { mutateAsync: updateAdditionalInfo } =
        useUpdateProductAdditionalInfo()

    useEffect(() => {
        if (initialValue?.rich_text) {
            const contentState = contentStateFromTextOrHTML(
                '',
                initialValue.rich_text,
            )
            setEditorState(EditorState.createWithContent(contentState))
        } else {
            setEditorState(EditorState.createEmpty())
        }
        lastSavedContentRef.current = initialValue?.rich_text || ''
    }, [productId, initialValue])

    const currentCharCount = useMemo(() => {
        if (editorState.getCurrentContent().getPlainText().length === 0) {
            // By default the HTML we generate has some tags for empty content
            // and it looks weird to show 15 charecters already used when the
            // content is empty.
            return 0
        }
        return convertToHTML(editorState.getCurrentContent()).length
    }, [editorState])

    const handleChange = useCallback((newEditorState: EditorState) => {
        const newCharCount = convertToHTML(
            newEditorState.getCurrentContent(),
        ).length

        if (newCharCount <= MAX_CHAR_COUNT) {
            setEditorState(newEditorState)
        }
    }, [])

    const saveContent = useCallback(async () => {
        const content = editorState.getCurrentContent()
        const html = convertToHTML(content)

        if (html === lastSavedContentRef.current) {
            return
        }

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

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Additional information saved',
                    showDismissButton: true,
                }),
            )
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to save additional information',
                    showDismissButton: true,
                }),
            )
        } finally {
            setIsSaving(false)
        }
    }, [editorState, updateAdditionalInfo, integrationId, productId, dispatch])

    const handleBlur = useCallback(() => {
        setIsFocused(false)

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            void saveContent()
        }, 300)
    }, [saveContent])

    const handleFocus = useCallback(() => {
        setIsFocused(true)
    }, [])

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    const charCountText = useMemo(() => {
        return `${currentCharCount}/${MAX_CHAR_COUNT} characters (formatting consumes available characters)`
    }, [currentCharCount])

    return (
        <div className={css.container}>
            <div
                className={classnames(css.editorContainer, {
                    [css.focused]: isFocused,
                })}
            >
                <RichField
                    value={{
                        html: convertToHTML(editorState.getCurrentContent()),
                        text: editorState.getCurrentContent().getPlainText(''),
                    }}
                    onChange={handleChange}
                    placeholder="Add additional product information..."
                    minHeight={150}
                    displayedActions={displayedActions}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    spellCheck={true}
                    allowExternalChanges={true}
                />
            </div>

            <div className={css.footer}>
                <span
                    className={classnames(css.charCount, {
                        [css.limitReached]: currentCharCount >= MAX_CHAR_COUNT,
                    })}
                >
                    {charCountText}
                </span>
                {isSaving && (
                    <span className={css.savingIndicator}>Saving...</span>
                )}
            </div>
        </div>
    )
}

export default ProductAdditionalInfoView
