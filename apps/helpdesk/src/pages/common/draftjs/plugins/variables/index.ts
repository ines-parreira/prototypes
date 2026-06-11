import type { EditorState } from 'draft-js'

import { variableDecorators as decorators } from './decorators'
import { attachEntitiesToVariables } from './utils'

const variablesPlugin = () => {
    return {
        decorators,
        // attach entities to variables
        onChange: (editorState: EditorState) =>
            attachEntitiesToVariables(editorState),
    }
}

export { variablesPlugin }
