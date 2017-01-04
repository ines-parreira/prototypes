import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import {isEmail} from '../../../../../utils'
import {
    getValuePropFromSourceType,
    receiversValueFromState,
    receiversStateFromValue
} from '../../../../../state/ticket/utils'

class ReceiversDropdown extends React.Component {
    componentDidMount() {
        this._setInitialValues()
    }

    componentDidUpdate(prevProps) {
        const shouldSetInitialValues = prevProps.sourceType !== this.props.sourceType
            || prevProps.parentId !== this.props.parentId

        if (shouldSetInitialValues) {
            this._setInitialValues()
        }
    }

    _valueFromState = (options) => receiversValueFromState(options, this.props.sourceType)

    _setInitialValues() {
        this._onChange(this._valueFromState(this.props.initialValues.toJS()))
    }

    _onChange = (value) => {
        this.props.actions.ticket.setReceivers(receiversStateFromValue(value, this.props.sourceType))
    }

    // add email when typing a separator
    _onInputChange = (value) => {
        if (!value) {
            return value
        }

        const separators = [',', ' ']

        // if last character of input is a separator
        if (separators.includes(value.slice(-1))) {
            const stripValue = value.slice(0, -1)

            if (!isEmail(stripValue)) {
                return value
            }

            this.refs.receiverDropdown.refs.select.selectValue({
                label: stripValue,
                value: stripValue,
            })

            return ''
        }

        return value
    }

    // add email when blurring field
    _onBlur = (event) => {
        const value = event.target.value
        if (isEmail(value)) {
            this.refs.receiverDropdown.refs.select.selectFocusedOption()
        }
    }

    _search = _debounce((input, callback) => {
        const queryText = input.toLowerCase()

        this.props.actions.ticket.updatePotentialRequesters(this.props.generateQuery(queryText))
            .then((data) => {
                callback(null, {
                    options: this._valueFromState(data)
                })
            })
    }, 200)

    render() {
        const {sourceType, enabled, valueProp} = this.props

        const addLabelText = 'Add the email address "{label}" ?'

        const placeholder = valueProp ? 'Search a user...' : 'Sorry, no recipient for this type of message...'

        return (
            <div className="receiver-dropdown">
                <Select.Async
                    ref="receiverDropdown"
                    multi
                    cache={false}
                    name="receiver-dropdown"
                    value={this._valueFromState(this.props.value)}
                    onChange={this._onChange}
                    onInputChange={this._onInputChange}
                    loadOptions={this._search}
                    disabled={!enabled}
                    allowCreate={sourceType === 'email'}
                    allowCreateConstraint={isEmail}
                    addLabelText={addLabelText}
                    placeholder={placeholder}
                    onBlur={this._onBlur}
                    onBlurResetsInput={false}
                    tabIndex="2"
                />
            </div>
        )
    }
}

ReceiversDropdown.propTypes = {
    actions: PropTypes.object.isRequired,
    initialValues: PropTypes.object.isRequired, // the values which should populate the field when it mounts

    generateQuery: PropTypes.func.isRequired,

    value: PropTypes.array.isRequired,
    enabled: PropTypes.bool.isRequired, // whether the dropdown should allow user interactions or not
    parentId: PropTypes.string.isRequired, // the id of the parent object, to check if the field needs to be repopulated

    valueProp: PropTypes.string, // the property to display from the object
    sourceType: PropTypes.string.isRequired
}

const mapStateToProps = (state, ownProps) => ({
    valueProp: getValuePropFromSourceType(ownProps.sourceType),
})

export default connect(mapStateToProps)(ReceiversDropdown)

