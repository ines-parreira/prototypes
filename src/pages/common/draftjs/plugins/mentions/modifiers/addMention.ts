/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import {Modifier, EditorState, EditorChangeType} from 'draft-js'
import {Map} from 'immutable'

import {getSearchText, getTypeByTrigger} from '../utils'

const addMention = (
    editorState: EditorState,
    mention: Map<unknown, unknown>,
    mentionPrefix: string,
    mentionTrigger: string,
    entityMutability: 'SEGMENTED' | 'IMMUTABLE' | 'MUTABLE'
) => {
    const contentState = editorState.getCurrentContent()
    const entityContentState = contentState.createEntity(
        getTypeByTrigger(mentionTrigger),
        entityMutability,
        {
            // add mention as plain object,
            // to be able to cache draftjs' convertToRaw
            mention: mention.toJS(),
        }
    )
    const entityKey = entityContentState.getLastCreatedEntityKey()

    const currentSelectionState = editorState.getSelection()
    const {begin, end} = getSearchText(editorState, currentSelectionState)

    // get selection of the @mention search text
    const mentionTextSelection = currentSelectionState.merge({
        anchorOffset: begin,
        focusOffset: end,
    })

    let mentionReplacedContent = Modifier.replaceText(
        contentState,
        mentionTextSelection,
        `${mentionPrefix}${mention.get('name') as string}`,
        undefined, // no inline style needed
        entityKey
    )

    // If the mention is inserted at the end, a space is appended right after for
    // a smooth writing experience.
    const blockKey = mentionTextSelection.getAnchorKey()
    const blockSize = contentState.getBlockForKey(blockKey).getLength()
    if (blockSize === end) {
        mentionReplacedContent = Modifier.insertText(
            mentionReplacedContent,
            mentionReplacedContent.getSelectionAfter(),
            ' '
        )
    }

    const newEditorState = EditorState.push(
        editorState,
        mentionReplacedContent,
        'insert-mention' as EditorChangeType
    )
    return EditorState.forceSelection(
        newEditorState,
        mentionReplacedContent.getSelectionAfter()
    )
}

export default addMention
