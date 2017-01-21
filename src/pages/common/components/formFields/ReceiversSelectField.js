import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import MultiSelectAsyncField from './MultiSelectAsyncField'
// import Select from 'react-select'
// import 'react-select/dist/react-select.css'
import {isEmail} from '../../../../utils'
import {
    getValuePropFromSourceType,
    receiversValueFromState,
    receiversStateFromValue
} from '../../../../state/ticket/utils'
import _set from 'lodash/set'
import _debounce from 'lodash/debounce'
import {updatePotentialRequesters} from '../../../../state/ticket/actions'

class ReceiversSelectField extends React.Component {
    /**
     * Search query for async search on input typing
     * @param searchValue
     * @returns Object
     * @private
     */
    _searchQuery = (searchValue) => {
        const query = {
            _source: ['id', 'address', 'type', 'user'],
            size: 5,
            query: {
                filtered: {
                    filter: {
                        bool: {
                            must: [{
                                match: {
                                    type: this.props.channel
                                }
                            }]
                        }
                    },
                    query: {
                        multi_match: {
                            query: '',
                            fuzziness: 3,
                            fields: ['address', 'user.name'],
                            type: 'phrase_prefix'
                        }
                    }
                }
            }
        }

        _set(query, 'query.filtered.query.multi_match.query', searchValue)

        return query
    }

    _valueFromState = (options) => receiversValueFromState({to: options}, this.props.sourceType).to

    _onChange = (value) => {
        const {input: {onChange}, sourceType} = this.props
        onChange(receiversStateFromValue({to: value}, sourceType).to)
    }

    _search = _debounce((input, callback) => {
        const queryText = input.toLowerCase()

        if (!queryText) {
            callback([])
        }

        this.props.updatePotentialRequesters(this._searchQuery(queryText))
            .then((data) => {
                callback(this._valueFromState(data))
            })
    }, 200)

    render() {
        const {sourceType, isDisabled, valueProp, input: {value}} = this.props

        const placeholder = valueProp ? 'Search a user...' : 'Sorry, no recipient for this type of message...'

        return (
            <MultiSelectAsyncField
                ref="receiverDropdown"
                name="receiver-dropdown"
                input={{
                    value: this._valueFromState(value),
                    onChange: this._onChange,
                }}
                loadOptions={this._search}
                disabled={isDisabled}
                allowCreate={sourceType === 'email'}
                allowCreateConstraint={isEmail}
                placeholder={placeholder}
                tabIndex="2"
            />
        )
    }
}

ReceiversSelectField.propTypes = {
    input: PropTypes.object.isRequired,
    updatePotentialRequesters: PropTypes.func.isRequired,

    isDisabled: PropTypes.bool.isRequired, // whether the dropdown should allow user interactions or not
    parentId: PropTypes.string.isRequired, // the id of the parent object, to check if the field needs to be repopulated

    valueProp: PropTypes.string, // the property to display from the object
    sourceType: PropTypes.string.isRequired,
    channel: PropTypes.string.isRequired,
}

const mapStateToProps = (state, ownProps) => ({
    valueProp: getValuePropFromSourceType(ownProps.sourceType),
})

function mapDispatchToProps(dispatch) {
    return {
        updatePotentialRequesters: bindActionCreators(updatePotentialRequesters, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiversSelectField)
