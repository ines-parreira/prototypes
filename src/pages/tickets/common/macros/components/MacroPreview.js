import React, {PropTypes} from 'react'
import Preview from '../Preview'

export default class MacroPreview extends React.Component {
    apply = () => {
        this.props.apply()
    }

    render() {
        const {currentMacro, cancel, selectedItemsIds} = this.props

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
                <div className="ui vertical segment">
                    <h2>{currentMacro.get('name') || ''}</h2>

                    <Preview
                        macro={currentMacro}
                    />
                </div>
                <div className="buttons-bar">
                    <div
                        className="ui green right floated button"
                        onClick={this.apply}
                    >
                        Apply macro to {selectedItemsIds.size} tickets
                    </div>
                    <div
                        className="ui basic grey right floated button"
                        onClick={cancel}
                    >
                        Cancel
                    </div>
                </div>
            </div>
        )
    }
}

MacroPreview.propTypes = {
    currentMacro: PropTypes.object,
    apply: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    selectedItemsIds: PropTypes.object.isRequired
}
