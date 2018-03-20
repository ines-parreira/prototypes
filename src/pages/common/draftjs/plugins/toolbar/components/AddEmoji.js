import React, {PropTypes} from 'react'
import {Picker} from 'emoji-mart'

import 'emoji-mart/css/emoji-mart.css'

import Popover from './Popover'

export default class AddEmoji extends React.Component {
    static propTypes = {
        action: PropTypes.object.isRequired,
        functions: PropTypes.object.isRequired,
    }

    _addEmoji = (emoji) => {
        this.props.functions.addEmoji(emoji)
        this.popover._close()
    }

    render() {
        return (
            <Popover
                icon="insert_emoticon"
                name={this.props.action.name}
                onIconClick={this.props.functions.onClick}
                ref={(popover) => {
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
