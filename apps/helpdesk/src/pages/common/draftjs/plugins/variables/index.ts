import type { EditorState } from 'draft-js'

import decorators from './decorators'
import { attachEntitiesToVariables } from './utils'

const variablesPlugin = () => {
    return {
        decorators,
        // attach entities to variables
        onChange: (editorState: EditorState) =>
            attachEntitiesToVariables(editorState),
    }
}

export default variablesPlugin
