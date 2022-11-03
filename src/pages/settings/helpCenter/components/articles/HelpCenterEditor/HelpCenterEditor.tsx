/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import React, {useCallback, useEffect, useRef} from 'react'
import FroalaEditorComponent from 'react-froala-wysiwyg'
import bytes from 'bytes'

import {zip} from 'lodash'
import useAppDispatch from '../../../../../../hooks/useAppDispatch'
import {LocaleCode} from '../../../../../../models/helpCenter/types'
import {notify} from '../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import {uploadFiles} from '../../../../../../utils'

import {useEditionManager} from '../../../providers/EditionManagerContext'
import {FroalaEditor, config} from './froala-config'
import {Editor} from './types'
import {
    generateEditorAttachmentHTML,
    HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS,
    createOnCloseEventHandler,
    validateFileAttachments,
} from './HelpCenterEditor.utils'

type Props = {
    articleId?: number
    locale: LocaleCode
    value?: string
    onChange: (value: string, charCount?: number) => void
    onEditorReady: (content: string) => void
}

type FroalaEditorInstance = FroalaEditorComponent & {
    editor: Editor
    editorInitialized: boolean
}

const HelpCenterEditor = ({
    locale,
    value = '',
    onChange,
    onEditorReady,
}: Props) => {
    const dispatch = useAppDispatch()
    const editorRef = useRef<FroalaEditorInstance | null>(null)
    const {setIsEditorCodeViewActive} = useEditionManager()
    const nrOfFileAttachments = useRef(0)
    const editorOnRemoveAttachmentHandler = useRef<EventListener>()

    useEffect(() => {
        setIsEditorCodeViewActive(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (editorRef.current?.editorInitialized) {
            editorRef.current.editor.html.set(value)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale])

    const onModelChange = (newModel: string) => {
        const charCount = editorRef.current?.editor.charCounter.count()

        onChange(newModel, charCount)
    }

    const resetEditorOnRemoveAttachmentHandlers = useCallback(
        (editor: Editor, onRemoveAttachmentHandler: EventListener) => {
            const removeAttachmentElements = editor.el.querySelectorAll(
                '.' + HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS.closeIcon
            )

            nrOfFileAttachments.current = removeAttachmentElements.length

            removeAttachmentElements.forEach((element) => {
                element.removeEventListener('click', onRemoveAttachmentHandler)
                element.addEventListener('click', onRemoveAttachmentHandler)
            })
        },
        []
    )

    return (
        <FroalaEditorComponent
            model={value}
            ref={editorRef}
            onModelChange={onModelChange}
            tag="textarea"
            config={{
                ...config,
                events: {
                    'file.beforeUpload': function (fileList: FileList): false {
                        const files = Array.from(fileList)
                        if (files.length === 0) {
                            return false
                        }

                        const errorMessage = validateFileAttachments(
                            nrOfFileAttachments.current,
                            files
                        )

                        if (errorMessage !== null) {
                            void dispatch(
                                notify({
                                    status: NotificationStatus.Error,
                                    message: errorMessage,
                                })
                            )
                            return false
                        }

                        void uploadFiles(files)
                            .then((attachments) => {
                                const editor = editorRef.current?.editor

                                if (
                                    !editor ||
                                    !editorOnRemoveAttachmentHandler.current
                                ) {
                                    // This should not happen, this is only for typescript to get this is not null
                                    return false
                                }

                                zip(files, attachments).forEach(
                                    ([file, attachment]) => {
                                        if (!file || !attachment) return

                                        const prettySize = bytes(file.size, {
                                            decimalPlaces: 1,
                                        })

                                        const html =
                                            generateEditorAttachmentHTML({
                                                fileName: file.name,
                                                prettySize,
                                                url: attachment.url,
                                            })

                                        editor.html.insert(html, false)
                                    }
                                )

                                editor.undo.saveStep()

                                resetEditorOnRemoveAttachmentHandlers(
                                    editor,
                                    editorOnRemoveAttachmentHandler.current
                                )
                            })
                            .catch((err) => {
                                void dispatch(
                                    notify({
                                        status: NotificationStatus.Error,
                                        message: err.message,
                                    })
                                )
                            })

                        return false
                    },
                    'image.beforeUpload': function (images: FileList) {
                        if (images.length === 0) {
                            return false
                        }

                        void uploadFiles([images[0]])
                            .then((res) => {
                                const editor = editorRef.current?.editor

                                if (!editor) {
                                    // This should not happen, this is only for typescript to get this is not null
                                    return false
                                }

                                // intercept the insertion of the image
                                // else by default, froala uses base64 images
                                const {url} = res[0]

                                editor.image.insert(
                                    url,
                                    false,
                                    null,
                                    editor.image.get(),
                                    res
                                )
                            })
                            .catch(() => {
                                void dispatch(
                                    notify({
                                        message: 'Failed to upload the image',
                                        status: NotificationStatus.Error,
                                    })
                                )
                            })

                        // return false so that Froala next actions won't be triggered
                        return false
                    },
                    'commands.before': function (command: string) {
                        const editor = editorRef.current?.editor

                        if (!editor) return

                        // Clear formatting before applying paragraph format
                        if (command === 'paragraphFormat') {
                            editor.commands.clearFormatting()
                        }
                    },
                    'commands.after': function () {
                        const editor = editorRef.current?.editor

                        if (!editor) return

                        setIsEditorCodeViewActive(editor.codeView.isActive())
                    },
                    'video.linkError': function () {
                        const editor = editorRef.current?.editor

                        if (!editor) return

                        const videoProviders: string[] =
                            FroalaEditor.VIDEO_PROVIDERS.map(
                                ({provider}: {provider: string}) => provider
                            )
                        const $popup = editor.popups
                            .get('video.insert')
                            .find('.fr-video-progress-bar-layer')
                            .find('h3')

                        // Customize video link error message
                        $popup.html(
                            `Unsupported video link.</br>Supported video platforms: ${videoProviders.join(
                                ', '
                            )}.`
                        )
                    },
                    initialized: function () {
                        const editor = editorRef.current?.editor
                        if (!editor) return

                        const content = editor.html.get(true)
                        onEditorReady(content)

                        const closeClickEventHandler =
                            createOnCloseEventHandler(editor)

                        editorOnRemoveAttachmentHandler.current =
                            closeClickEventHandler

                        resetEditorOnRemoveAttachmentHandlers(
                            editor,
                            closeClickEventHandler
                        )
                    },
                },
            }}
        />
    )
}

export default HelpCenterEditor
