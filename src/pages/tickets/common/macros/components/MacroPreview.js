import React from 'react'
import PropTypes from 'prop-types'

import Preview from '../Preview'

export default class MacroPreview extends React.Component {
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

MacroPreview.propTypes = {
    currentMacro: PropTypes.object,
}
