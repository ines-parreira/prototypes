import {setConnectedLinks} from './utils'

const connectedLinksPlugin = () => {
    return {
        // set connected links - same text and href
        onChange: (editorState) => setConnectedLinks(editorState),
    }
}

export default connectedLinksPlugin
