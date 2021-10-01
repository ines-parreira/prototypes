import {
    HelpCenterEditorToolbarInline,
    inlineOptions,
} from './HelpCenterEditorToolbarInline'
import {
    HelpCenterEditorToolbarHistory,
    historyOptions,
} from './HelpCenterEditorToolbarHistory'
import {
    HelpCenterEditorToolbarList,
    listOptions,
} from './HelpCenterEditorToolbarList'
import {
    blockOptions,
    HelpCenterEditorToolbarBlockDropdown,
} from './HelpCenterEditorToolbarBlockDropdown'
import {HelpCenterEditorToolbarLink} from './HelpCenterEditorToolbarLink'
import {HelpCenterEditorToolbarImage} from './HelpCenterEditorToolbarImage'
import {HelpCenterEditorToolbarEmoji} from './HelpCenterEditorToolbarEmoji'
import {HelpCenterEditorToolbarColorPicker} from './HelpCenterEditorToolbarColorPicker'

export const toolbarConfig = {
    options: [
        'history',
        'blockType',
        'inline',
        'list',
        'colorPicker',
        'image',
        'link',
        'emoji',
    ],
    history: {
        component: HelpCenterEditorToolbarHistory,
        options: historyOptions,
    },
    inline: {
        component: HelpCenterEditorToolbarInline,
        options: inlineOptions.map(({name}) => name),
    },
    list: {
        component: HelpCenterEditorToolbarList,
        options: listOptions,
    },
    blockType: {
        inDropdown: true,
        options: blockOptions,
        component: HelpCenterEditorToolbarBlockDropdown,
    },
    image: {
        component: HelpCenterEditorToolbarImage,
        alignmentEnabled: false,
    },
    link: {
        component: HelpCenterEditorToolbarLink,
    },
    emoji: {
        component: HelpCenterEditorToolbarEmoji,
    },
    colorPicker: {
        component: HelpCenterEditorToolbarColorPicker,
    },
}
