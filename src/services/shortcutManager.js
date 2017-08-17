import Mousetrap from 'mousetrap'
import * as mousetrap from 'mousetrap'
import _merge from 'lodash/merge'
import _clone from 'lodash/clone'
import _get from 'lodash/get'
import keymap from '../pages/common/utils/keymap'
import {getModifier, isEditable, closest} from '../utils'

class ShortcutManager {
    constructor() {
        Mousetrap.prototype.stopCallback = (e, element, combo) => {
            // if one of the element's parents
            // has the class "shortcuts-enable" then no need to stop.
            // or, if the combo includes 'mod' or 'meta',
            // the event should be triggered.
            if (closest(element, '.shortcuts-enable') || combo.includes('mod') || combo.includes('meta')) {
                return false
            }

            // stop for editable elements (input, select, textarea, contentEditable)
            return isEditable(element)
        }
    }

    bind(component = 'global', actions = {}) {
        // allow overwriting shortcut properties from components
        const componentActions = _merge(_clone(keymap[component].actions), actions)

        // bind all shortcut actions
        Object.keys(componentActions).forEach((actionName) => {
            const action = componentActions[actionName]
            mousetrap.bind(action.key, action.action)
        })
    }

    unbind(component) {
        const componentActions = keymap[component].actions
        Object.keys(componentActions).forEach((actionName) => {
            const action = componentActions[actionName]
            mousetrap.unbind(action.key)
        })
    }

    getActionConfig(component = 'global', actionName) {
        return _get(keymap, [component, 'actions', actionName], {})
    }

    trigger(key) {
        return mousetrap.trigger(key)
    }

    parseKeyPart(keyPart) {
        const modifiers = {
            mod: 'Ctrl',
            meta: 'Meta'
        }

        if (keyPart in modifiers) {
            return getModifier(modifiers[keyPart])
        }

        // capitalize long words
        if (keyPart.length > 1) {
            return keyPart.charAt(0).toUpperCase() + keyPart.slice(1)
        }

        return keyPart
    }

    parseKeyString(keyString) {
        return keyString.split('+').map((keyPart) => {
            return keyPart.split(' ').map(this.parseKeyPart).join(' ')
        }).join(' + ')
    }

    getActionKeys(action) {
        if (typeof action.key === 'object') {
            return action.key.map((keyString) => {
                return this.parseKeyString(keyString)
            })
        }

        return this.parseKeyString(action.key)
    }
}

export default new ShortcutManager()
