import React from 'react'
import shortcutManager from '../utils/shortcutManager'
import keymap from '../utils/keymap'

export default class KeyboardHelp extends React.Component {
    showHelp() {
        $('#keyboard-shortcuts').modal({
            blurring: true
        })
        .modal('show')
        .modal('refresh')
    }

    componentDidMount() {
        // bind keyboard shortcuts
        shortcutManager.bind('KeyboardHelp', {
            SHOW_HELP: {
                action: this.showHelp
            }
        })
    }

    componentWillUnmount() {
        shortcutManager.unbind('KeyboardHelp')
    }

    render() {
        return (
            <div id="keyboard-shortcuts" className="ui modal scrolling">
                <i className="right close icon"/>
                <div className="header">Keyboard shortcuts</div>

                <div className="content">

                    {Object.keys(keymap).map((componentName, i) => {
                        const component = keymap[componentName]
                        const actions = component.actions

                        return (
                            <div className="keyboard-shortcuts-group" key={i}>
                                <h3>{component.description}</h3>

                                {Object.keys(actions).map((actionName, j) => {
                                    const action = actions[actionName]

                                    if (!action.description) {
                                        return null
                                    }

                                    return (
                                        <div className="keyboard-shortcuts-group-item" key={j}>
                                            <div className="ui label horizontal keyboard-shortcuts-group-item-key">
                                                {shortcutManager.getActionKeys(action)}
                                            </div>

                                            {action.description}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>

                <div className="actions">
                    <div className="ui cancel button">Close</div>
                </div>
            </div>
        )
    }
}
