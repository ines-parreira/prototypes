import {fromJS} from 'immutable'
import {ACTION_TEMPLATES} from '../../config'

export function getMacrosWithoutExternalActions(currentMacros) {
    return currentMacros.filter(
        macro => macro.get('actions').filter(
            action => fromJS(ACTION_TEMPLATES).getIn([action.get('name'), 'execution']) === 'back'
        ).isEmpty()
    )
}
