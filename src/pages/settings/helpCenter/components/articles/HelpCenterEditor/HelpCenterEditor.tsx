/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/**
 * TODO: Froala types are not complete, we will refine the types ourselves
 */
import React, {useEffect, useRef} from 'react'
import _capitalize from 'lodash/capitalize'
import FroalaEditorComponent from 'react-froala-wysiwyg'

// Froala Editor basic JS
import FroalaEditor from 'froala-editor/js/froala_editor.min.js'

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

import {
    FROALA_CUSTOM_VIDEO_PROVIDERS,
    FROALA_KEY,
} from '../../../../../../config'
import useAppDispatch from '../../../../../../hooks/useAppDispatch'
import {LocaleCode} from '../../../../../../models/helpCenter/types'
import {notify} from '../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import {uploadFiles} from '../../../../../../utils'
import {EDITOR_MODAL_CONTAINER_ID, MAX_IMAGE_SIZE} from '../../../constants'

import css from './HelpCenterEditor.less'

type Props = {
    articleId?: number
    locale: LocaleCode
    value?: string
    onChange: (value: string) => void
    onEditorCodeViewToggle: (value: boolean) => void
}

type FroalaEditorInstance = FroalaEditorComponent & {
    editorInitialized: boolean
    /**
     * Editor has these available methods https://froala.com/wysiwyg-editor/docs/methods/
     */
    editor: any
}

// Override `VIDEO_PROVIDERS` to add custom video providers
// Original config: `/node_modules/froala-editor/js/plugins/video.min.js`
FroalaEditor.VIDEO_PROVIDERS = [
    ...FroalaEditor.VIDEO_PROVIDERS,
    ...FROALA_CUSTOM_VIDEO_PROVIDERS,
]

const HelpCenterEditor = ({
    locale,
    value = '',
    onChange,
    onEditorCodeViewToggle,
}: Props) => {
    const dispatch = useAppDispatch()
    const editorRef = useRef<FroalaEditorInstance | null>(null)

    useEffect(() => {
        onEditorCodeViewToggle(false)
    }, [])

    useEffect(() => {
        if (editorRef.current && editorRef.current.editorInitialized) {
            editorRef.current.getEditor().html.set(value)
        }
    }, [locale])

    const onModelChange = (newModel: string) => {
        onChange(newModel)
    }

    return (
        <FroalaEditorComponent
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
                scrollableContainer: `#${EDITOR_MODAL_CONTAINER_ID}`, // apply correct position for popups inside editor (e.g. table editor)
                /**
                 * Image upload cf. https://froala.com/wysiwyg-editor/docs/concepts/image/upload/
                 */
                imageMaxSize: MAX_IMAGE_SIZE,
                fontFamily: {
                    'Arial,Helvetica,sans-serif': 'Arial',
                    'Georgia,serif': 'Georgia',
                    'Impact,Charcoal,sans-serif': 'Impact',
                    Inter: 'Inter',
                    Merriweather: 'Merriweather',
                    'Source Code Pro': 'Source Code Pro',
                    'Tahoma,Geneva,sans-serif': 'Tahoma',
                    "'Times New Roman',Times,serif": 'Times New Roman',
                    'Verdana,Geneva,sans-serif': 'Verdana',
                },
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
                    'commands.after': function () {
                        onEditorCodeViewToggle(
                            (this as any).codeView.isActive()
                        )
                    },
                    'video.linkError': function () {
                        const editor = editorRef.current?.getEditor()

                        // Customize video link error message
                        if (editor) {
                            const videoProviders: string[] =
                                FroalaEditor.VIDEO_PROVIDERS.map(
                                    ({provider}: {provider: string}) => provider
                                )
                            const $popup = editor.popups
                                .get('video.insert')
                                .find('.fr-video-progress-bar-layer')
                                .find('h3')

                            $popup.html(
                                `Unsupported video link.</br>Supported video platforms: ${videoProviders
                                    .map(_capitalize)
                                    .join(', ')}.`
                            )
                        }
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
