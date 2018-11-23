//@flow
import {RichUtils, EditorState, ContentBlock, CharacterMetadata } from 'draft-js'
import {insertText} from '../../../../../utils'
import AddLink from './components/AddLink'
import AddImage from './components/AddImage'
import AddEmoji from './components/AddEmoji'
import {addImage} from '../utils'
import {getMaxAttachmentSize} from '../../../../../utils/file'
import type { Action, ToolbarAction, EditorStateSetter, Emoji } from './types'

const actions: Action[] = [
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
        active: (block: ContentBlock, editorState: EditorState) => {
            const contentState = editorState.getCurrentContent()

            if (!contentState.hasText()) {
                return false
            }

            let active = false
            const selection = editorState.getSelection()
            block.findEntityRanges(
                (character: CharacterMetadata) => {
                    const entityKey = character.getEntity()
                    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'link'
                },
                (start: number, end: number) => {
                    if (block.getKey() === selection.anchorKey && selection.anchorKey === selection.focusKey) {
                        if (selection.anchorOffset >= start && selection.focusOffset <= end) {
                            active = true
                        }
                    }
                }
            )
            return active
        },
        componentFunctions: {
            onClick: (block: ContentBlock, action: ToolbarAction, editorState: EditorState, setEditorState: EditorStateSetter) => 
                (): boolean => {
                    const selection = editorState.getSelection()

                    if (action.active && action.active(block, editorState)) {
                        // if already a link, remove it
                        setEditorState(RichUtils.toggleLink(editorState, selection, null))
                        return false
                    }

                    return true
                },
            onAddLink: (block: ContentBlock, action: ToolbarAction, editorState: EditorState, setEditorState: EditorStateSetter) => 
                (url: string): void => {
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
        componentFunctions: {
            onAddImage: (block: ContentBlock, action: ToolbarAction, editorState: EditorState, setEditorState: EditorStateSetter) => (url: string, size: number = 0) => {
                const newEditorState = addImage(editorState, url, size)
                setEditorState(newEditorState)
            },
            getMaxAttachmentSize: (block: ContentBlock, action: ToolbarAction, editorState: EditorState) => () => {
                return getMaxAttachmentSize(editorState, action.toolbarProps.attachments)
            }
        },
    },
    {
        key: 'emoji',
        name: 'Insert emoji',
        component: AddEmoji,
        componentFunctions: {
            onAddEmoji: (block: ContentBlock, action: ToolbarAction, editorState: EditorState, setEditorState: EditorStateSetter) => (emoji: Emoji) => {
                let newEditorState = insertText(editorState, emoji.native)

                // forcing the current selection ensures that it will be at it's right place
                newEditorState = EditorState.forceSelection(newEditorState, newEditorState.getSelection())

                setEditorState(newEditorState)
            }
        },
    },
]

export default actions
