import React from 'react'

import * as mousetrap from 'mousetrap'

export default class KeyboardHelp extends React.Component {
    componentDidMount() {
        // Show keyboard shortcuts
        mousetrap.bind('?', (e) => {
            $('#keyboard-shortcuts').modal({
                blurring: true
            }).modal('show')
        })
    }

    render() {
        return (
            <div id="keyboard-shortcuts" className="ui modal">
                <i className="right close icon"/>
                <div className="header">Keyboard shortcuts</div>
                <div className="content">
                    <div className="ui label">g i</div>
                    Go home
                </div>
                <div className="content">
                    <div className="ui label">g i</div>
                    Go home
                </div>
                <div className="actions">
                    <div className="ui cancel button">Close</div>
                </div>
            </div>
        )
    }
}