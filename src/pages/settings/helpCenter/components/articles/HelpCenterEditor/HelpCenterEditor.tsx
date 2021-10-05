/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/**
 * TODO: Froala types are not complete, we will refine the types ourselves
 */
import React, {useEffect, useRef} from 'react'

import FroalaEditor from 'react-froala-wysiwyg'

import {LocaleCode} from '../../../../../../models/helpCenter/types'
import {FROALA_KEY} from '../../../../../../config'

// Froala Editor basic JS
import 'froala-editor/js/froala_editor.min.js'

// Froala Editor plugins
import 'froala-editor/js/plugins/align.min.js'
import 'froala-editor/js/plugins/char_counter.min.js'
import 'froala-editor/js/plugins/code_view.min.js'
import 'froala-editor/js/plugins/colors.min.js'
import 'froala-editor/js/plugins/draggable.min.js'
import 'froala-editor/js/plugins/emoticons.min.js'
import 'froala-editor/js/plugins/entities.min.js'
import 'froala-editor/js/plugins/font_family.min.js'
import 'froala-editor/js/plugins/font_size.min.js'
import 'froala-editor/js/plugins/help.min.js'
import 'froala-editor/js/plugins/image.min.js'
import 'froala-editor/js/plugins/inline_style.min.js'
import 'froala-editor/js/plugins/line_breaker.min.js'
import 'froala-editor/js/plugins/line_height.min.js'
import 'froala-editor/js/plugins/link.min.js'
import 'froala-editor/js/plugins/lists.min.js'
import 'froala-editor/js/plugins/paragraph_format.min.js'
import 'froala-editor/js/plugins/paragraph_style.min.js'
import 'froala-editor/js/plugins/quick_insert.min.js'
import 'froala-editor/js/plugins/quote.min.js'
import 'froala-editor/js/plugins/special_characters.min.js'
import 'froala-editor/js/plugins/table.min.js'
import 'froala-editor/js/plugins/url.min.js'
import 'froala-editor/js/plugins/video.min.js'
import 'froala-editor/js/plugins/word_paste.min.js'

import {MAX_IMAGE_SIZE} from '../../../constants'

import {uploadFiles} from '../../../../../../utils'
import {notify} from '../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import useAppDispatch from '../../../../../../hooks/useAppDispatch'

import css from './HelpCenterEditor.less'

type Props = {
    articleId?: number
    locale: LocaleCode
    value?: string
    onChange: (value: string) => void
}

type FroalaEditorInstance = FroalaEditor & {
    editorInitialized: boolean
    /**
     * Editor has these available methods https://froala.com/wysiwyg-editor/docs/methods/
     */
    editor: any
}

const HelpCenterEditor = ({locale, value = '', onChange}: Props) => {
    const dispatch = useAppDispatch()
    const editorRef = useRef<FroalaEditorInstance | null>(null)

    useEffect(() => {
        if (editorRef.current && editorRef.current.editorInitialized) {
            editorRef.current.getEditor().html.set(value)
        }
    }, [locale])

    const onModelChange = (newModel: string) => {
        onChange(newModel)
    }

    return (
        <FroalaEditor
            model={value}
            ref={editorRef}
            onModelChange={onModelChange}
            tag="textarea"
            config={{
                /** Base froala editor config */
                videoResponsive: true,
                key: FROALA_KEY,
                editorClass: css.froalaEditorWrapper,
                attribution: false,
                htmlRemoveTags: [], // IMPORTANT: prevent script tags from being removed
                typingTimer: 150, // allows updating the model much faster
                height: '100%',
                heightMax: '100%',
                /**
                 * Image upload cf. https://froala.com/wysiwyg-editor/docs/concepts/image/upload/
                 */
                imageMaxSize: MAX_IMAGE_SIZE,
                events: {
                    'image.beforeUpload': function (images: FileList) {
                        if (images.length === 0) {
                            return false
                        }
                        void uploadFiles([images[0]])
                            .then((res) => {
                                if (!editorRef.current) {
                                    // This should not happen, this is only for typescript to get this is not null
                                    return false
                                }
                                // intercept the insertion of the image
                                // else by default, froala uses base64 images
                                const {url} = res[0]

                                if (editorRef.current.getEditor()) {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                    editorRef.current.getEditor().image.insert(
                                        url,
                                        false,
                                        null,
                                        // eslint-disable-next-line
                                        editorRef.current
                                            .getEditor()
                                            .image.get(),
                                        res
                                    )
                                }
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
                },
                toolbarButtons: {
                    moreText: {
                        buttons: [
                            'bold',
                            'italic',
                            'underline',
                            'strikeThrough',
                            'subscript',
                            'superscript',
                            'fontFamily',
                            'fontSize',
                            'textColor',
                            'backgroundColor',
                            'inlineClass',
                            'inlineStyle',
                            'clearFormatting',
                        ],
                    },
                    moreParagraph: {
                        buttons: [
                            'alignLeft',
                            'alignCenter',
                            'formatOLSimple',
                            'alignRight',
                            'alignJustify',
                            'formatOL',
                            'formatUL',
                            'paragraphFormat',
                            'paragraphStyle',
                            'lineHeight',
                            'outdent',
                            'indent',
                            'quote',
                        ],
                    },
                    moreRich: {
                        buttons: [
                            'insertImage',
                            'insertLink',
                            'insertVideo',
                            'insertTable',
                            'emoticons',
                            'specialCharacters',
                            'insertHR',
                        ],
                    },
                    moreMisc: {
                        buttons: ['undo', 'redo', 'selectAll', 'html', 'help'],
                        align: 'right',
                        buttonsVisible: 2,
                    },
                },
                videoInsertButtons: [
                    'videoBack',
                    '|',
                    'videoByURL',
                    'videoEmbed',
                ],
                videoUpload: false,
                linkList: [
                    {
                        text: 'Google',
                        href: 'https://google.com',
                        target: '_blank',
                        rel: 'nofollow',
                    },
                    {
                        text: 'Facebook',
                        href: 'https://facebook.com',
                        target: '_blank',
                        rel: 'nofollow',
                    },
                ],
                emoticonsUseImage: false,
            }}
        />
    )
}

export default HelpCenterEditor
