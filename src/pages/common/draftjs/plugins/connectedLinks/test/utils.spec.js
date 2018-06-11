import {EditorState} from 'draft-js'
import {convertFromHTML} from 'draft-convert'

import {setConnectedLinks} from '../utils'

describe('Connected Links utils', () => {
    describe('setConnectedLinks', () => {
        it('should transform link into connected link', () => {
            let editorState = EditorState.createWithContent(
                convertFromHTML({
                    htmlToEntity: (nodeName, node, createEntity) => {
                        if (nodeName === 'a') {
                            return createEntity(
                                'link',
                                'MUTABLE',
                                {url: node.href}
                            )
                        }
                    },
                })('<a href="https://gorgias.io/">https://gorgias.io/</a>')
            )

            editorState = setConnectedLinks(editorState)
            const contentState = editorState.getCurrentContent()
            const entityKey = contentState.getLastCreatedEntityKey()

            expect(contentState.getEntity(entityKey).getData().connected).toBe(true)
        })
    })
})
