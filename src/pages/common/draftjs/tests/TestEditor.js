import React from 'react'
import PropTypes from 'prop-types'
import Editor from 'draft-js-plugins-editor'

import * as utils from './utils'

export default class TestEditor extends React.Component {
    static propTypes = {
        html: PropTypes.string,
        editorState: PropTypes.object,
        plugins: PropTypes.array,
    }

    constructor(props) {
        super(props)

        const editorState = props.editorState ? props.editorState : utils.editorStateFromHtml(props.html)

        this.state = {
            editorState,
        }
    }

    render() {
        return (
            <Editor
                editorState={this.state.editorState}
                onChange={(editorState) => editorState}
                plugins={this.props.plugins}
                ref={(editor) => {
                    this.editor = editor
                }}
            />
        )
    }
}
