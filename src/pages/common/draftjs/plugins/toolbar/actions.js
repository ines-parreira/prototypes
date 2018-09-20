import {RichUtils, EditorState} from 'draft-js'
import {insertText} from '../../../../../utils'
import AddLink from './components/AddLink'
import AddImage from './components/AddImage'
import AddEmoji from './components/AddEmoji'
import {addImage} from '../utils'
import {getMaxAttachmentSize} from '../../../../../utils/file'

export default [
    {
        key: 'bold',
        name: 'Bold',
        icon: 'format_bold',
        style: 'BOLD'
    },
    {
        key: 'italic',
        name: 'Italic',
        icon: 'format_italic',
        style: 'ITALIC'
    },
    {
        key: 'underline',
        name: 'Underline',
        icon: 'format_underline',
        style: 'UNDERLINE'
    },
    {
        key: 'link',
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
                    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'link'
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

                // if no 'http' at the beginning of the url AND it is not a variable, add it
                if (!/^https?:\/\//i.test(url) && !url.startsWith('{')) {
                    url = `http://${url}`
                }

                // nothing selected, insert link as text
                if (selection.isCollapsed()) {
                    return setEditorState(insertText(editorState, url))
                }

                const entityContentState = editorState.getCurrentContent().createEntity(
                    'link',
                    'MUTABLE',
                    {url}
                )
                const entityKey = entityContentState.getLastCreatedEntityKey()
                setEditorState(RichUtils.toggleLink(editorState, selection, entityKey))
            },
        }
    },
    {
        key: 'image',
        name: 'Insert image',
        component: AddImage,
        functions: {
            addImage: (block, action, editorState, setEditorState, url, size = 0) => {
                const newEditorState = addImage(editorState, url, size)
                setEditorState(newEditorState)
            },
            getMaxAttachmentSize: (block, action, editorState) => {
                return getMaxAttachmentSize(editorState, action.toolbarProps.attachments)
            }
        },
    },
    {
        key: 'emoji',
        name: 'Insert emoji',
        component: AddEmoji,
        functions: {
            addEmoji: (block, action, editorState, setEditorState, emoji) => {
                let newEditorState = insertText(editorState, emoji.native)

                // forcing the current selection ensures that it will be at it's right place
                newEditorState = EditorState.forceSelection(newEditorState, newEditorState.getSelection())

                setEditorState(newEditorState)
            }
        },
    },
]
