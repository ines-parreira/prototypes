// @flow
import React from 'react'
import {Picker} from 'emoji-mart'

const EmojiPicker = (props: {}) => (
    <Picker
        autoFocus
        native
        color="#0d87dd"
        perLine={8}
        sheetSize={16}
        {...props}
    />
)

export default EmojiPicker
