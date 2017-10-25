// @flow
import Mousetrap from 'mousetrap'
import _merge from 'lodash/merge'
import _clone from 'lodash/clone'
import _get from 'lodash/get'
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

    _getComponentKeymap(component: string) {
        if (!this._keymap[component] || !this._keymap[component].actions) {
            this._keymap[component] = {
                actions: {}
            }
        }

        return this._keymap[component]
    }

    _setComponentKeymap(component: string, keymap: {}) {
        this._keymap[component] = keymap
    }

    _bound = []
    bind(component: string = 'global', actions: keymapActionsType = {}) {
        // allow overwriting shortcut properties from components and
        // merge actions into the keymap object,
        // so we can to rebind previously bound component actions
        // using just the component name.
        // allows unbind/re-bind actions of component actions,
        // from different component.
        this._setComponentKeymap(component, _merge(this._getComponentKeymap(component), {actions}))
        const index = _findIndex(this._bound, (b) => b.name === component)
        if (!~index) {
            this._bound.push({
                name: component,
                paused: this._isPaused
            })
        }

        this._bindMousetrap()
    }

    unbind(component: string) {
        const index = _findIndex(this._bound, (b) => b.name === component)
        if (~index) {
            this._bound.splice(index, 1)
        }
    }

    _isPaused = false

    pause(whitelist: Array<string> = []) {
        this._isPaused = true

        this._bound.forEach((b) => {
            if (!whitelist.includes(b.name)) {
                b.paused = true
            }
        })
    }

    unpause() {
        this._isPaused = false

        this._bound.forEach((b) => b.paused = false)
    }

    _globalAction = (e: Event, combo: string) => {
        const filteredComponents = this._bound.filter((b) => {
            if (!b.paused) {
                return true
            }

            return false
        })

        filteredComponents.forEach((c) => {
            const keymap = this._getComponentKeymap(c.name)
            Object.keys(keymap.actions).forEach((a) => {
                const action = keymap.actions[a]
                if (
                    (typeof action.key === 'object' && action.key.includes(combo))
                    || action.key === combo
                ) {
                    action.action(e)
                }
            })
        })
    }

    _bindMousetrap() {
        const keys = []
        Object.keys(this._keymap).forEach((c) => {
            const keymap = this._getComponentKeymap(c)
            Object.keys(keymap.actions).forEach((a) => {
                const action = keymap.actions[a]
                if (typeof action.key === 'object') {
                    Array.prototype.push.apply(keys, action.key)
                } else {
                    keys.push(action.key)
                }
            })
        })

        // bind all possible hotkeys to the global handler
        mousetrap.bind(keys, this._globalAction)
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
