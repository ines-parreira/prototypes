// @flow
import Mousetrap from 'mousetrap'
import _merge from 'lodash/merge'
import _clone from 'lodash/clone'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import _findIndex from 'lodash/findIndex'

import keymap from '../../config/shortcuts'
import {getModifier, isEditable, isButton, closest} from './utils'

const mousetrap = new Mousetrap()

type keyboardActionType = {
    key: string,
    action: (e: Event) => void,
    description?: string,
    component?: string
}

type keymapActionsType = {
    [string]: keyboardActionType
}

export class ShortcutManager {
    constructor() {
        mousetrap.stopCallback = this._stopCallback
    }

    _stopCallback = (e: Event, element: HTMLElement, combo: string) => {
        // if one of the element's parents
        // has the class "shortcuts-enable" then no need to stop.
        // or, if the combo includes 'mod' or 'meta',
        // the event should be triggered.
        // escape key works all the time.
        if (
            closest(element, '.shortcuts-enable')
            || combo.includes('mod')
            || combo.includes('meta')
            || combo.includes('esc')
            || combo.includes('escape')
        ) {
            return false
        }

        // stop on editable elements (input, select, textarea, contentEditable),
        // and buttons.
        return isEditable(element) || isButton(element)
    }

    _keymap = _clone(keymap)

    // keep track of bound keys and events,
    // to be able to support multiple events on the same combo.
    // https://github.com/ccampbell/mousetrap/issues/108
    // https://github.com/ccampbell/mousetrap/issues/98
    // eg. {'a': Array<{key: string, action: () => {}}>}
    _hotkeys = {}

    _cacheKey(action: keyboardActionType, component: string) {
        action.component = component

        // set-up cache
        const keys = this._hotkeys[action.key] || []

        // don't add empty actions or duplicates
        if (!action.action) {
            return keys
        }

        // update the action fn if duplicate
        const duplicateIndex = _findIndex(keys, (k) => _isEqual(k, action))

        if (~duplicateIndex) {
            keys[duplicateIndex].action = action.action
        } else {
            keys.push(action)
        }

        this._hotkeys[action.key] = keys

        return keys
    }

    // remove actions with the same combo, from the same component
    _clearKeyCache(action: keyboardActionType, component: string) {
        const keys = (this._hotkeys[action.key] || []).filter((a) => {
            return a.component !== component
        })

        this._hotkeys[action.key] = keys

        return keys
    }

    _getHotkeys(key?: string) {
        if (!key) {
            return this._hotkeys
        }

        return this._hotkeys[key]
    }

    _getKeymapActions(component: string) {
        if (!this._keymap[component] || !this._keymap[component].actions) {
            this._keymap[component] = {
                actions: {}
            }
        }

        return this._keymap[component].actions
    }

    bind(component: string = 'global', actions: keymapActionsType = {}) {
        // allow overwriting shortcut properties from components and
        // merge actions into the keymap object,
        // so we can to rebind previously bound component actions
        // using just the component name.
        // allows unbind/re-bind actions of component actions,
        // from different component.
        const componentActions = _merge(this._getKeymapActions(component), actions)

        // bind all shortcut actions
        Object.keys(componentActions).forEach((actionName) => {
            const action = componentActions[actionName]
            const keys = this._cacheKey(action, component)

            this._bindMousetrap(action, keys)
        })
    }

    unbind(component: string) {
        // remove all cached actions on the same component
        const hotkeys = this._getHotkeys()
        Object.keys(hotkeys).forEach((key) => {
            const actions = this._getHotkeys(key)

            actions.forEach((action) => {
                // clean cache
                const keys = this._clearKeyCache(action, component)

                this._bindMousetrap(action, keys)
            })
        })
    }

    pause(whitelist: Array<string> = ['esc']) {
        mousetrap.stopCallback = (e, element, combo) => {
            if (whitelist.includes(combo)) {
                return this._stopCallback(e, element, combo)
            }

            return true
        }
    }

    unpause() {
        mousetrap.stopCallback = this._stopCallback
    }

    _bindMousetrap(action: keyboardActionType, keys: Array<keyboardActionType>) {
        if (!keys.length) {
            return mousetrap.unbind(action.key)
        }

        return mousetrap.bind(action.key, (e) => {
            keys.forEach((key) => key.action(e))
        })
    }

    triggerAction(component: string = 'global', actionName: string) {
        const config = _get(this._keymap, [component, 'actions', actionName], {})

        if (!config) {
            return
        }

        return this.trigger(config.key)
    }

    trigger(key: string) {
        return mousetrap.trigger(key)
    }

    parseKeyPart(keyPart: string) {
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

    parseKeyString(keyString: string) {
        return keyString.split('+').map((keyPart) => {
            return keyPart.split(' ').map(this.parseKeyPart).join(' ')
        }).join(' + ')
    }

    getActionKeys(action: keyboardActionType) {
        if (typeof action.key === 'object') {
            return action.key.map((keyString) => {
                return this.parseKeyString(keyString)
            }).join(' / ')
        }

        return this.parseKeyString(action.key)
    }
}

export default new ShortcutManager()
