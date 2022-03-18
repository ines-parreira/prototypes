import React, {Component} from 'react'
import {Map} from 'immutable'

import Preview from '../Preview'

type Props = {
    currentMacro: Map<any, any>
}

export default class MacroPreview extends Component<Props> {
    render() {
        const {currentMacro} = this.props

        if (!currentMacro) {
            return (
                <div className="MacroPreview">
                    <div className="no-result-container">
                        <p>
                            You don't have any macro you can apply on a batch of
                            tickets.
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="MacroPreview">
                <div className="mt-3 mb-3">
                    <h2>{currentMacro.get('name') || ''}</h2>

                    <Preview
                        displayHTML={true}
                        actions={currentMacro.get('actions')}
                    />
                </div>
            </div>
        )
    }
}
