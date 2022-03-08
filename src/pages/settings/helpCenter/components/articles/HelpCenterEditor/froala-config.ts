/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

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
import 'froala-editor/js/plugins/image.min.js'
import 'froala-editor/js/plugins/line_breaker.min.js'
import 'froala-editor/js/plugins/line_height.min.js'
import 'froala-editor/js/plugins/link.min.js'
import 'froala-editor/js/plugins/lists.min.js'
import 'froala-editor/js/plugins/paragraph_format.min.js'
import 'froala-editor/js/plugins/quick_insert.min.js'
import 'froala-editor/js/plugins/table.min.js'
import 'froala-editor/js/plugins/url.min.js'
import 'froala-editor/js/plugins/video.min.js'
import 'froala-editor/js/plugins/word_paste.min.js'

import {FROALA_KEY, FROALA_VIDEO_PROVIDERS} from '../../../../../../config'
import {EDITOR_MODAL_CONTAINER_ID, MAX_IMAGE_SIZE} from '../../../constants'

import css from './HelpCenterEditor.less'

// Override `VIDEO_PROVIDERS` to add custom video providers
FroalaEditor.VIDEO_PROVIDERS = FROALA_VIDEO_PROVIDERS

// Define material design icons
const materialIconTemplate = 'material_design'

FroalaEditor.DefineIconTemplate(
    materialIconTemplate,
    '<i class="material-icons-round">[NAME]</i>'
)

// Define toolbar buttons
type Button =
    | {
          command: string
      }
    | {
          command: string
          icon: string
          materialIcon: string
      }

type HorizontalSeparator = '|'
type VerticalSeparator = '-'

const isSeparator = (
    button: Button | HorizontalSeparator | VerticalSeparator
): button is HorizontalSeparator | VerticalSeparator =>
    button === '|' || button === '-'

const toolbarButtons: (Button | HorizontalSeparator | VerticalSeparator)[] = [
    {
        command: 'paragraphFormat',
    },
    '|',
    {
        command: 'fontFamily',
    },
    '|',
    {
        command: 'fontSize',
    },
    {
        command: 'lineHeight',
        icon: 'lineHeight',
        materialIcon: 'height',
    },
    '|',
    {
        command: 'bold',
        icon: 'bold',
        materialIcon: 'format_bold',
    },
    {
        command: 'italic',
        icon: 'italic',
        materialIcon: 'format_italic',
    },
    {
        command: 'underline',
        icon: 'underline',
        materialIcon: 'format_underlined',
    },
    {
        command: 'strikeThrough',
        icon: 'strikeThrough',
        materialIcon: 'strikethrough_s',
    },
    '|',
    {
        command: 'textColor',
        icon: 'textColor',
        materialIcon: 'format_color_text',
    },
    {
        command: 'backgroundColor',
        icon: 'backgroundColor',
        materialIcon: 'border_color',
    },
    '|',
    {
        command: 'clearFormatting',
        icon: 'clearFormatting',
        materialIcon: 'format_clear',
    },
    '|',
    {
        command: 'undo',
        icon: 'undo',
        materialIcon: 'undo',
    },
    {
        command: 'redo',
        icon: 'redo',
        materialIcon: 'redo',
    },
    '-',
    {
        command: 'alignLeft',
        icon: 'align-left',
        materialIcon: 'format_align_left',
    },
    {
        command: 'alignCenter',
        icon: 'align-center',
        materialIcon: 'format_align_center',
    },
    {
        command: 'alignRight',
        icon: 'align-right',
        materialIcon: 'format_align_right',
    },
    {
        command: 'alignJustify',
        icon: 'align-justify',
        materialIcon: 'format_align_justify',
    },
    '|',
    {
        command: 'outdent',
        icon: 'outdent',
        materialIcon: 'format_indent_decrease',
    },
    {
        command: 'indent',
        icon: 'indent',
        materialIcon: 'format_indent_increase',
    },
    '|',
    {
        command: 'formatUL',
        icon: 'formatUL',
        materialIcon: 'format_list_bulleted',
    },
    {
        command: 'formatOLSimple',
        icon: 'formatOLSimple',
        materialIcon: 'format_list_numbered',
    },
    '|',
    {
        command: 'insertImage',
        icon: 'insertImage',
        materialIcon: 'image',
    },
    {
        command: 'insertVideo',
        icon: 'insertVideo',
        materialIcon: 'video_library',
    },
    {
        command: 'insertLink',
        icon: 'insertLink',
        materialIcon: 'link',
    },
    {
        command: 'insertTable',
        icon: 'insertTable',
        materialIcon: 'table_chart',
    },
    {
        command: 'insertHR',
        icon: 'insertHR',
        materialIcon: 'horizontal_rule',
    },
    {
        command: 'emoticons',
        icon: 'emoticons',
        materialIcon: 'insert_emoticon',
    },
    '|',
    {
        command: 'html',
        icon: 'html',
        materialIcon: 'code',
    },
]

// Override button icons
toolbarButtons.forEach((button) => {
    if (typeof button === 'object' && 'icon' in button) {
        FroalaEditor.DefineIcon(button.icon, {
            NAME: button.materialIcon,
            template: materialIconTemplate,
        })
    }
})

// Initialize Froala config
// See https://froala.com/wysiwyg-editor/docs/options
const config = {
    // General options
    key: FROALA_KEY,
    attribution: false,
    editorClass: css.froalaEditorWrapper,
    height: '100%',
    heightMax: '100%',
    htmlRemoveTags: [], // IMPORTANT: prevent script tags from being removed
    scrollableContainer: `#${EDITOR_MODAL_CONTAINER_ID}`, // apply correct position for popups inside editor (e.g. table editor)
    typingTimer: 150, // allows updating the model much faster

    toolbarButtons: {
        // Put all buttons into moreText (moreText, moreRich & moreMisc will have the same effects)
        moreText: {
            buttons: toolbarButtons.map((button) =>
                isSeparator(button) ? button : button.command
            ),
            // Show all. We use verticalSeparator to split the buttons into two rows.
            buttonsVisible: toolbarButtons.length,
        },
    },

    // Char count plugin
    charCounterCount: false,

    // Emoticons plugin
    emoticonsUseImage: false,

    // Font family plugin
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
    fontFamilySelection: true,

    // Font size plugin
    fontSizeSelection: true,

    // Image plugin
    imageMaxSize: MAX_IMAGE_SIZE,

    // Link plugin
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

    // Paragraph format plugin
    paragraphFormat: {
        N: 'Normal',
        H1: 'Heading 1',
        H2: 'Heading 2',
        H3: 'Heading 3',
        H4: 'Heading 4',
        PRE: 'Code',
        BLOCKQUOTE: 'Quote',
    },
    paragraphFormatSelection: true,

    // Video plugin
    videoInsertButtons: ['videoBack', '|', 'videoByURL', 'videoEmbed'],
    videoResponsive: true,
    videoUpload: false,
}

export {FroalaEditor, config}
