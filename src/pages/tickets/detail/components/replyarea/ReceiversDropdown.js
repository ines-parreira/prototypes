import React, {PropTypes} from 'react'
import _ from 'lodash'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import {isEmail} from '../../../../../utils'
import {displayUserNameFromSource} from '../../../common/utils'

class ReceiversDropdown extends React.Component {
    constructor(props) {
        super(props)

        this._valueFromState = this._valueFromState.bind(this)
        this._search = this._search.bind(this)
        this._search = _.debounce(this._search, 200)
    }

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

    _valueFromState(options) {
        return options.map((user) => {
            const value = user[this.props.valueProp]

            return {
                id: user.id,
                name: user.name,
                label: displayUserNameFromSource(user, this.props.sourceType),
                value
            }
        })
    }

    _setInitialValues() {
        const users = this._valueFromState(this.props.initialValues.toJS())

        this._onChange(users)
    }

    _onChange = (value) => {
        const newValue = value || []
        const fieldName = this.props.valueProp

        this.props.actions.ticket.setReceivers(newValue.map((user) => {
            return {
                id: user.id,
                name: user.name,
                [fieldName]: user.value
            }
        }))
    }

    _search(input, callback) {
        const queryText = input.toLowerCase()

        this.props.actions.ticket.updatePotentialRequesters(this.props.generateQuery(queryText), (error, data) => {
            callback(null, {
                options: this._valueFromState(data)
            })
        })
    }

    render() {
        const {sourceType, enabled} = this.props

        const addLabelText = 'Add the email address "{label}" ?'

        return (
            <div className="receiver-dropdown">
                <Select.Async
                    multi
                    cache={false}
                    name="receiver-dropdown"
                    value={this._valueFromState(this.props.value)}
                    onChange={this._onChange}
                    loadOptions={this._search}
                    disabled={!enabled}
                    allowCreate={sourceType === 'email'}
                    allowCreateConstraint={isEmail}
                    addLabelText={addLabelText}
                    placeholder="Search a user..."
                    tabSelectsValue={false}
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

    valueProp: PropTypes.string.isRequired, // the property to display from the object
    sourceType: PropTypes.string.isRequired
}

export default ReceiversDropdown
