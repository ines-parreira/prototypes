import {attachEntitiesToVariables} from './utils'
import decorators from './decorators'

const variablesPlugin = () => {
    return {
        decorators,
        // attach entities to variables
        onChange: (editorState) => attachEntitiesToVariables(editorState),
    }
}

export default variablesPlugin
