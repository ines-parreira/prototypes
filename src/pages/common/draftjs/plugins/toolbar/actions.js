import {RichUtils, EditorState, Entity, AtomicBlockUtils} from 'draft-js'
import {insertText} from '../../../../../utils'
import AddLink from './components/AddLink'
import AddImage from './components/AddImage'

export default [
    {
        label: 'Bold',
        name: 'Bold',
        icon: 'fa-bold',
        style: 'BOLD'
    },
    {
        label: 'Italic',
        name: 'Italic',
        icon: 'fa-italic',
        style: 'ITALIC'
    },
    {
        label: 'Underline',
        name: 'Underline',
        icon: 'fa-underline',
        style: 'UNDERLINE'
    },
    {
        label: 'Link',
        name: 'Insert link',
        component: AddLink,
        active: (block, editorState) => {
            const contentState = editorState.getCurrentContent()

            if (!contentState.hasText()) {
                return false
            }

            let active = false
            const selection = editorState.getSelection()
            block.findEntityRanges(
                (character) => {
                    const entityKey = character.getEntity()
                    return entityKey !== null && Entity.get(entityKey).getType() === 'link'
                },
                (start, end) => {
                    if (block.getKey() === selection.anchorKey && selection.anchorKey === selection.focusKey) {
                        if (selection.anchorOffset >= start && selection.focusOffset <= end) {
                            active = true
                        }
                    }
                }
            )
            return active
        },
        functions: {
            onClick: (block, action, editorState, setEditorState) => {
                const selection = editorState.getSelection()

                if (action.active(block, editorState)) {
                    // if already a link, remove it
                    setEditorState(RichUtils.toggleLink(editorState, selection, null))
                    return false
                }

                return true
            },
            addLink: (block, action, editorState, setEditorState, url) => {
                const selection = editorState.getSelection()

                // if no 'http' at the beginning of the url, add it
                if (!/^https?:\/\//i.test(url)) {
                    url = `http://${url}`
                }

                // nothing selected, insert link as text
                if (selection.isCollapsed()) {
                    return setEditorState(insertText(editorState, url))
                }

                const entityKey = Entity.create('link', 'MUTABLE', {url})
                setEditorState(RichUtils.toggleLink(editorState, selection, entityKey))
            },
        }
    },
    {
        label: 'Image',
        name: 'Insert image',
        component: AddImage,
        functions: {
            addImage: (block, action, editorState, setEditorState, url) => {
                const entityKey = Entity.create('img', 'IMMUTABLE', {src: url, width: '400'})
                let newEditorState = AtomicBlockUtils.insertAtomicBlock(
                    editorState,
                    entityKey,
                    ' ',
                )
                newEditorState = EditorState.forceSelection(
                    newEditorState,
                    editorState.getCurrentContent().getSelectionAfter()
                )
                setEditorState(newEditorState)
            }
        },
    }
]
