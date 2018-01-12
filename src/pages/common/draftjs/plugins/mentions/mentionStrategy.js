/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import {getTypeByTrigger} from './utils'

const findMention = (trigger, contentState) => (character) => {
    const entityKey = character.getEntity()
    return (entityKey !== null && contentState.getEntity(entityKey).getType() === getTypeByTrigger(trigger))
}

const findMentionEntities = (trigger) => (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(findMention(trigger, contentState), callback)
}

export default findMentionEntities
