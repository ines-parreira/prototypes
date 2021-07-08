import React, {Component} from 'react'
import {Badge} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'
import classnames from 'classnames'

import Modal from '../../components/Modal'

import shortcutManager from '../../../../services/shortcutManager/index'
import keymap from '../../../../config/shortcuts'

import css from './KeyboardHelp.less'

type State = {
    isOpen?: boolean
}

export default class KeyboardHelp extends Component<
    Record<string, never>,
    State
> {
    state = {
        isOpen: false,
    }

    componentDidMount() {
        // bind keyboard shortcuts
        shortcutManager.bind('KeyboardHelp', {
            SHOW_HELP: {
                action: () => this._toggle(true),
            },
            HIDE_HELP: {
                key: 'esc',
                action: () => this._toggle(false),
            },
        })
    }

    componentWillUnmount() {
        shortcutManager.unbind('KeyboardHelp')
    }

    _toggle = (visible: boolean) => {
        const opens = !_isUndefined(visible) ? visible : !this.state.isOpen
        this.setState({isOpen: opens})

        if (opens) {
            shortcutManager.pause()
        } else {
            shortcutManager.unpause()
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.state.isOpen}
                onClose={() => this._toggle(false)}
                header="Keyboard shortcuts"
                className={css.component}
            >
                <div className={css.content}>
                    {Object.keys(keymap).map((componentName, i) => {
                        const component = keymap[componentName]
                        const actions = component.actions

                        return (
                            <div
                                key={i}
                                className={classnames(css.group, 'mb-4')}
                            >
                                <h3>{component.description}</h3>

                                {Object.keys(actions).map(
                                    (actionName: string, j) => {
                                        const action = actions[actionName]

                                        if (!action.description) {
                                            return null
                                        }

                                        return (
                                            <div key={j} className="mb-2">
                                                <Badge
                                                    color="secondary"
                                                    className={classnames(
                                                        css.combo,
                                                        'mr-2'
                                                    )}
                                                >
                                                    {shortcutManager.getActionKeys(
                                                        action
                                                    )}
                                                </Badge>

                                                {action.description}
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        )
                    })}
                </div>
            </Modal>
        )
    }
}
