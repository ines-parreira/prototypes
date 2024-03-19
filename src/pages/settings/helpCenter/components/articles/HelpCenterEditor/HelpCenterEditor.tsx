/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import React, {useCallback, useEffect, useRef} from 'react'
import FroalaEditorComponentType from 'react-froala-wysiwyg'
import bytes from 'bytes'
import {zip} from 'lodash'

import classnames from 'classnames'
import useAppDispatch from 'hooks/useAppDispatch'
import {LocaleCode} from 'models/helpCenter/types'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {useEditionManager} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {replaceUploadUrls} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {uploadAttachments} from 'rest_api/help_center_api/uploadAttachments'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import FroalaEditorComponent from './FroalaEditorComponent.js'
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
    className?: string
    onChange: (value: string, charCount?: number) => void
    onEditorReady?: (content: string) => void
}

type FroalaEditorInstance = FroalaEditorComponentType & {
    editor: Editor
    editorInitialized: boolean
}

const HelpCenterEditor = ({
    locale,
    value = '',
    className,
    onChange,
    onEditorReady,
}: Props) => {
    const dispatch = useAppDispatch()
    const editorRef = useRef<FroalaEditorInstance | null>(null)
    const {setIsEditorCodeViewActive} = useEditionManager()
    const nrOfFileAttachments = useRef(0)
    const editorOnRemoveAttachmentHandler = useRef<EventListener>()

    // needed to specify the channel type of the attachment
    const helpCenter = useCurrentHelpCenter()
    const hasOnePagerLayout = helpCenter.layout === '1-pager'
    const onePagerConfig = {
        paragraphFormat: {
            N: 'Normal',
            PRE: 'Code',
            BLOCKQUOTE: 'Quote',
        },
        fontSize: ['8', '9', '10', '11', '12', '14', '16'],
    }

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
                ...(hasOnePagerLayout && onePagerConfig),
                editorClass: classnames(config.editorClass, className),
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

                        void uploadAttachments(files, {
                            id: helpCenter.id,
                            type: 'HC',
                        })
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

                        void uploadAttachments([images[0]], {
                            id: helpCenter.id,
                            type: 'HC',
                        })
                            .then((res) => {
                                const editor = editorRef.current?.editor

                                if (!editor) {
                                    // This should not happen, this is only for typescript to get this is not null
                                    return false
                                }

                                // intercept the insertion of the image
                                // else by default, froala uses base64 images
                                const {url} = res[0]

                                // This is needed to make sure the image we just uploaded is available at the given URL before trying to display it
                                setTimeout(() => {
                                    editor.image.insert(
                                        url,
                                        false,
                                        null,
                                        editor.image.get(),
                                        res
                                    )
                                }, 500)
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

                        onEditorReady?.(replaceUploadUrls(content))

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
