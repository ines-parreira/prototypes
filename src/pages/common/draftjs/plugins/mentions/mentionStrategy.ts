/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */
import {ContentBlock, ContentState, CharacterMetadata} from 'draft-js'
import {getTypeByTrigger} from './utils'

const findMention =
    (trigger: string, contentState: ContentState) =>
    (character: CharacterMetadata) => {
        const entityKey = character.getEntity()
        return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() ===
                getTypeByTrigger(trigger)
        )
    }

const findMentionEntities =
    (trigger: string) =>
    (
        contentBlock: ContentBlock,
        callback: (start: number, end: number) => void,
        contentState: ContentState
    ) => {
        contentBlock.findEntityRanges(
            findMention(trigger, contentState),
            callback
        )
    }

export default findMentionEntities
