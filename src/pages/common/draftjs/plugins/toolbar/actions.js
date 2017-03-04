import {RichUtils, Entity} from 'draft-js'

export default [
    {
        label: 'Bold',
        icon: 'bold',
        style: 'BOLD'
    },
    {
        label: 'Italic',
        icon: 'italic',
        style: 'ITALIC'
    },
    {
        label: 'Underline',
        icon: 'underline',
        style: 'UNDERLINE'
    },
    {
        label: 'Link',
        icon: 'linkify',
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
        toggle: (block, action, editorState, setEditorState) => {
            const selection = editorState.getSelection()
            // nothing selected, do nothing
            if (selection.isCollapsed()) {
                window.alert('You need to select some text before adding or removing a link')
                return
            }

            if (action.active(block, editorState)) {
                // if already a link, remove it
                setEditorState(RichUtils.toggleLink(editorState, selection, null))
            } else {
                // add new link
                let url = window.prompt('Enter a URL')

                // if no url written, do nothing
                if (!url) {
                    return
                }

                // if no 'http' at the beginning of the url, add it
                if (!/^https?:\/\//i.test(url)) {
                    url = `http://${url}`
                }
                const entityKey = Entity.create('link', 'MUTABLE', {url})
                setEditorState(RichUtils.toggleLink(editorState, selection, entityKey))
            }
        },
    },
]
