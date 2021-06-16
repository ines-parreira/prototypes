import {setConnectedLinks} from './utils.ts'

const connectedLinksPlugin = () => {
    return {
        // set connected links - same text and href
        onChange: (editorState) => setConnectedLinks(editorState),
    }
}

export default connectedLinksPlugin
