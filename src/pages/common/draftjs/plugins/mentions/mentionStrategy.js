/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import {Entity} from 'draft-js'
import {getTypeByTrigger} from './utils'

const findMention = (trigger) => (character) => {
    const entityKey = character.getEntity()
    return (entityKey !== null && Entity.get(entityKey).getType() === getTypeByTrigger(trigger))
}

const findMentionEntities = (trigger) => (contentBlock, callback) => {
    contentBlock.findEntityRanges(findMention(trigger), callback)
}

export default findMentionEntities
