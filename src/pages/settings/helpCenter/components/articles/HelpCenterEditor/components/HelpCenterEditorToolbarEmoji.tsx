import React, {useState} from 'react'
import {EmojiData} from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'

import EmojiPicker from '../../../../../../common/components/EmojiPicker/EmojiPicker'

import {HelpCenterEditorToolbarPopoverButton} from './HelpCenterEditorToolbarPopoverButton'

type Props = {
    onChange: (emoji: string) => void
}

export const HelpCenterEditorToolbarEmoji = ({onChange}: Props) => {
    const [expanded, setExpanded] = useState(false)

    const addEmoji = (emoji: EmojiData) => {
        if ('native' in emoji) {
            onChange(emoji.native)
            setExpanded(false)
        }
    }

    return (
        <HelpCenterEditorToolbarPopoverButton
            icon="emoji_emotions"
            tooltip="Emoji"
            isOpen={expanded}
            onOpen={() => setExpanded(true)}
            onClose={() => setExpanded(false)}
        >
            <EmojiPicker onClick={addEmoji} />
        </HelpCenterEditorToolbarPopoverButton>
    )
}
