import React, {Component} from 'react'
import 'emoji-mart/css/emoji-mart.css'
import {EditorState} from 'draft-js'
import {EmojiData} from 'emoji-mart'

import {ActionInjectedProps} from '../types'
import {insertText} from '../../../../../../utils'
import EmojiPicker from '../../../../components/EmojiPicker/EmojiPicker'

import Popover from './ButtonPopover'

type Props = ActionInjectedProps

type State = {
    isOpen: boolean
}

export default class AddEmoji extends Component<Props, State> {
    state: State = {
        isOpen: false,
    }

    _addEmoji = (emoji: EmojiData) => {
        const editorState = this.props.getEditorState()
        if ('native' in emoji) {
            let newEditorState = insertText(editorState, emoji.native)

            // forcing the current selection ensures that it will be at it's right place
            newEditorState = EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection()
            )

            this.props.setEditorState(newEditorState)
            this.setState({isOpen: false})
        }
    }

    _onPopoverOpen = () => this.setState({isOpen: true})

    _onPopoverClose = () => this.setState({isOpen: false})

    render() {
        return (
            <Popover
                icon="insert_emoticon"
                id="insert_emoticon"
                name="Insert emoji"
                className="p-0 d-flex"
                isOpen={this.state.isOpen}
                onOpen={this._onPopoverOpen}
                onClose={this._onPopoverClose}
            >
                <EmojiPicker onClick={this._addEmoji} />
            </Popover>
        )
    }
}
