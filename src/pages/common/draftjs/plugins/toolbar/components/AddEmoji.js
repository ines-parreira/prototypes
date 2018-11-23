//@flow
import React, { type ElementRef } from 'react'
import {Picker} from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import Popover from './Popover'
import type { ActionComponentProps, Emoji } from '../types'

type Props = {
    onAddEmoji: Emoji => boolean
} & ActionComponentProps

export default class AddEmoji extends React.Component<Props> {
    popover: ?ElementRef<typeof Popover>

    _addEmoji = (emoji: Emoji) => {
        this.props.onAddEmoji(emoji)
        this.popover && this.popover._close()
    }

    render() {
        return (
            <Popover
                icon="insert_emoticon"
                name={this.props.name}
                ref={(popover: ?ElementRef<typeof Popover>) => {
                    this.popover = popover
                }}
                className="p-0 d-flex"
            >
                <Picker
                    autoFocus
                    native
                    color="#0d87dd"
                    perLine={8}
                    sheetSize={16}
                    onClick={this._addEmoji}
                />
            </Popover>
        )
    }
}
