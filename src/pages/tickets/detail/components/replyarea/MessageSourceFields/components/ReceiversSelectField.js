import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import _debounce from 'lodash/debounce'

import {isEmail} from '../../../../../../../utils'
import {
    getValuePropFromSourceType,
    receiversValueFromState,
    receiversStateFromValue
} from '../../../../../../../state/ticket/utils'
import {updatePotentialRequesters} from '../../../../../../../state/newMessage/actions'

import MultiSelectAsyncField from './MultiSelectAsyncField/index'

class ReceiversSelectField extends React.Component {
    static propTypes = {
        value: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        updatePotentialRequesters: PropTypes.func.isRequired,

        disabled: PropTypes.bool.isRequired, // whether the dropdown should allow user interactions or not
        parentId: PropTypes.string.isRequired, // the id of the parent object, to check if the field needs to be repopulated

        valueProp: PropTypes.string, // the property to display from the object
        sourceType: PropTypes.string.isRequired,
        channel: PropTypes.string.isRequired,
        required: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        disabled: false,
        required: false,
    }

    _valueFromState = (options) => receiversValueFromState({to: options}, this.props.sourceType).to

    _onChange = (value) => {
        const {onChange, sourceType} = this.props
        onChange(receiversStateFromValue({to: value}, sourceType).to)
    }

    _search = _debounce((input, callback) => {
        const queryText = input.toLowerCase()

        if (!queryText) {
            callback([])
        }

        this.props.updatePotentialRequesters(queryText)
            .then((data) => {
                callback(this._valueFromState(data))
            })
    }, 200)

    render() {
        const {sourceType, disabled, required, valueProp, value} = this.props

        const placeholder = valueProp ? 'Search a user...' : 'Sorry, no recipient for this type of message...'

        return (
            <MultiSelectAsyncField
                ref="receiverDropdown"
                name="receiver-dropdown"
                value={this._valueFromState(value)}
                onChange={this._onChange}
                loadOptions={this._search}
                disabled={disabled}
                required={required}
                allowCreate={sourceType === 'email'}
                allowCreateConstraint={isEmail}
                placeholder={placeholder}
            />
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    valueProp: getValuePropFromSourceType(ownProps.sourceType),
})

const mapDispatchToProps = (dispatch) => ({
    updatePotentialRequesters: bindActionCreators(updatePotentialRequesters, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(ReceiversSelectField)
