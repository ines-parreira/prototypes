import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'

import {isEmail} from '../../../../../../../utils.ts'
import {
    getValuePropFromSourceType,
    receiversValueFromState,
    receiversStateFromValue,
} from '../../../../../../../state/ticket/utils.ts'
import {updatePotentialCustomers} from '../../../../../../../state/newMessage/actions.ts'
import withCancellableRequest from '../../../../../../common/utils/withCancellableRequest'

import MultiSelectAsyncField from './MultiSelectAsyncField/index'

class ReceiversSelectField extends React.Component {
    static propTypes = {
        value: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        updatePotentialCustomersCancellable: PropTypes.func.isRequired,

        disabled: PropTypes.bool.isRequired, // whether the dropdown should allow user interactions or not
        parentId: PropTypes.string.isRequired, // the id of the parent object, to check if the field needs to be repopulated

        valueProp: PropTypes.string, // the property to display from the object
        sourceType: PropTypes.string.isRequired,
        channel: PropTypes.string.isRequired,
        required: PropTypes.bool.isRequired,

        inputRef: PropTypes.func,
    }

    static defaultProps = {
        disabled: false,
        required: false,
    }

    _valueFromState = (options) =>
        receiversValueFromState({to: options}, this.props.sourceType).to

    _onChange = (value) => {
        const {onChange, sourceType} = this.props
        onChange(receiversStateFromValue({to: value}, sourceType).to)
    }

    _search = _debounce((input, callback) => {
        const {updatePotentialCustomersCancellable} = this.props
        const queryText = input.toLowerCase()

        if (!queryText) {
            callback([])
        }

        updatePotentialCustomersCancellable(queryText).then((data) => {
            if (!data) {
                return
            }
            callback(this._valueFromState(data))
        })
    }, 200)

    render() {
        const {sourceType, disabled, required, valueProp, value} = this.props

        const placeholder = valueProp
            ? 'Search a customer...'
            : 'Sorry, no recipient for this type of message...'

        return (
            <MultiSelectAsyncField
                ref={this.props.inputRef}
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

export default withCancellableRequest(
    'updatePotentialCustomersCancellable',
    updatePotentialCustomers
)(connect(mapStateToProps)(ReceiversSelectField))
