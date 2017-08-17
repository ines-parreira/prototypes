import React from 'react'
import {Badge} from 'reactstrap'

import Modal from '../components/Modal'

import shortcutManager from '../../../services/shortcutManager'
import keymap from '../utils/keymap'

export default class KeyboardHelp extends React.Component {
    state = {
        isOpen: false,
    }

    componentDidMount() {
        // bind keyboard shortcuts
        shortcutManager.bind('KeyboardHelp', {
            SHOW_HELP: {
                action: () => {
                    this.setState({isOpen: true})
                }
            }
        })
    }

    componentWillUnmount() {
        shortcutManager.unbind('KeyboardHelp')
    }

    _toggle = () => {
        this.setState({isOpen: false})
    }

    render() {
        return (
            <Modal
                isOpen={this.state.isOpen}
                onClose={this._toggle}
                header="Keyboard shortcuts"
            >
                {
                    Object.keys(keymap).map((componentName, i) => {
                        const component = keymap[componentName]
                        const actions = component.actions

                        return (
                            <div
                                key={i}
                                className="mb-4"
                            >
                                <h3>{component.description}</h3>

                                {
                                    Object.keys(actions).map((actionName, j) => {
                                        const action = actions[actionName]

                                        if (!action.description) {
                                            return null
                                        }

                                        return (
                                            <div
                                                key={j}
                                                className="mb-2"
                                            >
                                                <Badge
                                                    color="secondary"
                                                    className="keyboard-shortcuts-group-item-key mr-2"
                                                >
                                                    {shortcutManager.getActionKeys(action)}
                                                </Badge>

                                                {action.description}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </Modal>
        )
    }
}
