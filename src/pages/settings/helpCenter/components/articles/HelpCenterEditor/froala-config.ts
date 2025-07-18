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
import 'froala-editor/js/plugins/file.min.js'
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

import { FROALA_KEY, FROALA_VIDEO_PROVIDERS } from '../../../../../../config'
import { EDITOR_MODAL_CONTAINER_ID, MAX_IMAGE_SIZE } from '../../../constants'

import css from './HelpCenterEditor.less'

// Override `VIDEO_PROVIDERS` to add custom video providers
FroalaEditor.VIDEO_PROVIDERS = FROALA_VIDEO_PROVIDERS

// Define material design icons
const materialIconTemplate = 'material_design'

FroalaEditor.DefineIconTemplate(
    materialIconTemplate,
    '<i class="material-icons-round">[NAME]</i>',
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
    button: Button | HorizontalSeparator | VerticalSeparator,
): button is HorizontalSeparator | VerticalSeparator =>
    button === '|' || button === '-'

const buttons = {
    paragraphFormat: { command: 'paragraphFormat' },
    fontFamily: { command: 'fontFamily' },
    fontSize: { command: 'fontSize' },
    lineHeight: {
        command: 'lineHeight',
        icon: 'lineHeight',
        materialIcon: 'height',
    },
    bold: { command: 'bold', icon: 'bold', materialIcon: 'format_bold' },
    italic: {
        command: 'italic',
        icon: 'italic',
        materialIcon: 'format_italic',
    },
    underline: {
        command: 'underline',
        icon: 'underline',
        materialIcon: 'format_underlined',
    },
    strikeThrough: {
        command: 'strikeThrough',
        icon: 'strikeThrough',
        materialIcon: 'strikethrough_s',
    },
    textColor: {
        command: 'textColor',
        icon: 'textColor',
        materialIcon: 'format_color_text',
    },
    backgroundColor: {
        command: 'backgroundColor',
        icon: 'backgroundColor',
        materialIcon: 'border_color',
    },
    clearFormatting: {
        command: 'clearFormatting',
        icon: 'clearFormatting',
        materialIcon: 'format_clear',
    },
    undo: { command: 'undo', icon: 'undo', materialIcon: 'undo' },
    redo: { command: 'redo', icon: 'redo', materialIcon: 'redo' },
    alignLeft: {
        command: 'alignLeft',
        icon: 'align-left',
        materialIcon: 'format_align_left',
    },
    alignCenter: {
        command: 'alignCenter',
        icon: 'align-center',
        materialIcon: 'format_align_center',
    },
    alignRight: {
        command: 'alignRight',
        icon: 'align-right',
        materialIcon: 'format_align_right',
    },
    alignJustify: {
        command: 'alignJustify',
        icon: 'align-justify',
        materialIcon: 'format_align_justify',
    },
    outdent: {
        command: 'outdent',
        icon: 'outdent',
        materialIcon: 'format_indent_decrease',
    },
    indent: {
        command: 'indent',
        icon: 'indent',
        materialIcon: 'format_indent_increase',
    },
    formatUL: {
        command: 'formatUL',
        icon: 'formatUL',
        materialIcon: 'format_list_bulleted',
    },
    formatOLSimple: {
        command: 'formatOLSimple',
        icon: 'formatOLSimple',
        materialIcon: 'format_list_numbered',
    },
    insertFile: {
        command: 'insertFile',
        icon: 'insertFile',
        materialIcon: 'attach_file',
    },
    insertImage: {
        command: 'insertImage',
        icon: 'insertImage',
        materialIcon: 'image',
    },
    insertVideo: {
        command: 'insertVideo',
        icon: 'insertVideo',
        materialIcon: 'video_library',
    },
    insertLink: {
        command: 'insertLink',
        icon: 'insertLink',
        materialIcon: 'link',
    },
    insertTable: {
        command: 'insertTable',
        icon: 'insertTable',
        materialIcon: 'table_chart',
    },
    insertHR: {
        command: 'insertHR',
        icon: 'insertHR',
        materialIcon: 'horizontal_rule',
    },
    emoticons: {
        command: 'emoticons',
        icon: 'emoticons',
        materialIcon: 'insert_emoticon',
    },
    html: { command: 'html', icon: 'html', materialIcon: 'code' },
} as const

const separators = {
    vertical: '|' as const,
    horizontal: '-' as const,
} as const

const toolbarButtons: (Button | HorizontalSeparator | VerticalSeparator)[] = [
    buttons.paragraphFormat,
    separators.vertical,
    buttons.fontFamily,
    separators.vertical,
    buttons.fontSize,
    buttons.lineHeight,
    separators.vertical,
    buttons.bold,
    buttons.italic,
    buttons.underline,
    buttons.strikeThrough,
    separators.vertical,
    buttons.textColor,
    buttons.backgroundColor,
    separators.vertical,
    buttons.clearFormatting,
    separators.vertical,
    buttons.undo,
    buttons.redo,
    separators.horizontal,
    buttons.alignLeft,
    buttons.alignCenter,
    buttons.alignRight,
    buttons.alignJustify,
    separators.vertical,
    buttons.outdent,
    buttons.indent,
    separators.vertical,
    buttons.formatUL,
    buttons.formatOLSimple,
    separators.vertical,
    buttons.insertFile,
    buttons.insertImage,
    buttons.insertVideo,
    buttons.insertLink,
    buttons.insertTable,
    buttons.insertHR,
    buttons.emoticons,
    separators.vertical,
    buttons.html,
]

const toolbarButtonsXS: (Button | HorizontalSeparator | VerticalSeparator)[] = [
    buttons.paragraphFormat,
    separators.vertical,
    buttons.fontFamily,
    separators.vertical,
    buttons.fontSize,
    buttons.lineHeight,
    separators.vertical,
    buttons.bold,
    buttons.italic,
    buttons.underline,
    buttons.strikeThrough,
    buttons.textColor,
    separators.horizontal,
    buttons.alignLeft,
    buttons.alignCenter,
    buttons.alignRight,
    buttons.alignJustify,
    buttons.outdent,
    buttons.indent,
    separators.vertical,
    buttons.formatUL,
    buttons.formatOLSimple,
    separators.vertical,
    buttons.insertFile,
    buttons.insertImage,
    buttons.insertVideo,
    buttons.insertLink,
    buttons.emoticons,
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
                isSeparator(button) ? button : button.command,
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

    fontSize: [
        '8',
        '9',
        '10',
        '11',
        '12',
        '14',
        '15',
        '16',
        '18',
        '24',
        '30',
        '36',
        '48',
        '60',
        '72',
        '96',
    ],

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

    // Paste plugin
    pasteAllowedStyleProps: ['text-decoration'],
}

const configXS = {
    ...config,
    toolbarButtons: {
        moreText: {
            buttons: toolbarButtonsXS.map((button) =>
                isSeparator(button) ? button : button.command,
            ),
            buttonsVisible: toolbarButtonsXS.length,
        },
    },
}

export { FroalaEditor, config, configXS }
