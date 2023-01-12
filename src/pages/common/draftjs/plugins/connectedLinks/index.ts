import {EditorState} from 'draft-js'
import {setConnectedLinks} from './utils'

const connectedLinksPlugin = () => {
    return {
        // set connected links - same text and href
        onChange: (editorState: EditorState) => setConnectedLinks(editorState),
    }
}

export default connectedLinksPlugin
