import React, {PropTypes} from 'react'
import Preview from '../Preview'

export default class MacroPreview extends React.Component {
    render() {
        const {currentMacro} = this.props

        if (!currentMacro) {
            return (
                <div className="MacroPreview">
                    <div className="no-result-container">
                        <h4>You don't have any macro you can apply on a batch of tickets.</h4>
                    </div>
                </div>
            )
        }

        return (
            <div className="MacroPreview">
                <div className="mt-3 mb-3">
                    <h2>{currentMacro.get('name') || ''}</h2>

                    <Preview
                        macro={currentMacro}
                    />
                </div>
            </div>
        )
    }
}

MacroPreview.propTypes = {
    currentMacro: PropTypes.object,
}
