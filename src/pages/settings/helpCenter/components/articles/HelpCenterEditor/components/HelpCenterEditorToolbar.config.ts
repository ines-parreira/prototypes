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

export const toolbarConfig = {
    options: [
        'history',
        'blockType',
        'inline',
        'list',
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
        options: inlineOptions,
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
}
