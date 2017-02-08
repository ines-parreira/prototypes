import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import classnames from 'classnames'
import {ReceiversSelectField} from '../../../../common/components/formFields'
import * as ticketActions from '../../../../../state/ticket/actions'
import {
    getNewMessageType,
    getNewMessageChannel,
    makeGetNewMessageSourceProperty,
    getNewMessageRecipients,
    getContactProperties,
    getOptionalContactProperties,
    areNewMessageContactPropertiesFulfilled,
} from '../../../../../state/ticket/selectors'
import {
    receiversValueFromState,
    receiversStateFromValue,
} from '../../../../../state/ticket/utils'
import {displayUserNameFromSource} from '../../../common/utils'
import _upperFirst from 'lodash/upperFirst'
import _uniq from 'lodash/uniq'
import _difference from 'lodash/difference'
import _xor from 'lodash/xor'

class ReceiversDropdown extends React.Component {
    state = {
        displayedRows: [], // optional rows that are displayed
    }

    componentDidMount() {
        this._setInitialValues()
    }

    componentWillReceiveProps(nextProps) {
        const {isOpen: wasOpen} = this.props
        const {isOpen} = nextProps

        // if closing or opening, recalculating optional rows that we want to keep open
        if (wasOpen !== isOpen) {
            this._openUsedOptionalRows()
        }
    }

    componentDidUpdate(prevProps) {
        const shouldSetInitialValues = prevProps.sourceType !== this.props.sourceType
            || prevProps.parentId !== this.props.parentId

        if (shouldSetInitialValues) {
            this._setInitialValues()
        }
    }

    /**
     * Remember currently used rows as open
     * @private
     */
    _openUsedOptionalRows = () => {
        const {
            getNewMessageSourceProperty,
            availableContactProperties,
        } = this.props

        // remove unusued rows from optional ones
        const displayedOptionalRows = availableContactProperties.filter((r) => !getNewMessageSourceProperty(r).isEmpty())

        this.setState({
            displayedRows: displayedOptionalRows,
        })
    }

    _setInitialValues = () => {
        const {sourceType, setReceivers} = this.props
        const value = receiversValueFromState(this.props.initialValues, sourceType)
        setReceivers(receiversStateFromValue(value, sourceType))
    }

    _toggleOptionalRow = (row) => {
        this.setState({
            displayedRows: _xor(this.state.displayedRows, [row]),
        })
    }

    _renderOpened = () => {
        const {
            sourceType,
            enabled,
            channel,
            parentId,
            getNewMessageSourceProperty,
            setReceivers,
            availableContactProperties,
            optionalContactProperties,
        } = this.props

        // rows that are displayed by default
        const mandatoryRows = availableContactProperties.filter(r => !optionalContactProperties.includes(r))

        // available optional rows, depends on the rows configuration above (depends on source type or channel)
        const availableOptionalRows = availableContactProperties.filter(r => optionalContactProperties.includes(r))

        // selected optional rows or rows already containing data
        const displayedOptionalRows = availableOptionalRows.filter((r) => {
            return this.state.displayedRows.includes(r) || !getNewMessageSourceProperty(r).isEmpty()
        })

        // remaining optional rows not already displayed
        const remainingOptionalRows = _difference(availableOptionalRows, displayedOptionalRows)

        // final displayed rows
        const displayedRows = _uniq(mandatoryRows.concat(displayedOptionalRows))

        return (
            <div>
                {
                    // display fields
                    displayedRows.map((prop) => {
                        let value = getNewMessageSourceProperty(prop)

                        value = value.isEmpty() ? [] : value.toJS()

                        return (
                            <div
                                key={prop}
                                className="receivers-row"
                            >
                                <span className="label">{_upperFirst(prop)}: </span>
                                <ReceiversSelectField
                                    parentId={parentId}
                                    sourceType={sourceType}
                                    channel={channel}
                                    disabled={!enabled}
                                    required={mandatoryRows.includes(prop)}
                                    input={{
                                        value,
                                        onChange(recipients) {
                                            setReceivers({
                                                [prop]: recipients,
                                            }, false)
                                        },
                                    }}
                                />
                            </div>
                        )
                    })
                }

                {
                    // display buttons for optional fields
                    !!remainingOptionalRows.length && (
                        <div className="optional-rows">
                            {
                                remainingOptionalRows.map((prop, index) => (
                                    <span key={prop}>
                                        <span
                                            className="optional-row"
                                            onClick={(e) => {
                                                e.stopPropagation() // prevent the edit window from closing
                                                this._toggleOptionalRow(prop)
                                            }}
                                        >
                                            {_upperFirst(prop)}
                                        </span>
                                        {(index < remainingOptionalRows.length - 1) && ' / '}
                                    </span>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        )
    }

    _renderClosed = () => {
        const {sourceType, allRecipients, canOpen} = this.props

        const allDisplayedNames = allRecipients.toJS().map(v => displayUserNameFromSource(v, sourceType))

        return (
            <div className="receivers-row">
                <span className="label">To: </span>
                <span
                    className={classnames('receivers-list', {
                        editable: canOpen,
                    })}
                >
                    {allDisplayedNames.join(', ')}
                </span>
            </div>
        )
    }

    render() {
        return (
            <div className="receivers-dropdown">
                {this.props.isOpen ? this._renderOpened() : this._renderClosed()}
            </div>
        )
    }
}

ReceiversDropdown.propTypes = {
    setReceivers: PropTypes.func.isRequired,
    initialValues: PropTypes.object.isRequired, // the values which should populate the field when it mounts

    getNewMessageSourceProperty: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired, // whether the dropdown should allow user interactions or not
    parentId: PropTypes.string.isRequired, // the id of the parent object, to check if the field needs to be repopulated

    sourceType: PropTypes.string.isRequired,
    channel: PropTypes.string.isRequired,
    allRecipients: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    canOpen: PropTypes.bool.isRequired,
    availableContactProperties: PropTypes.array.isRequired,
    optionalContactProperties: PropTypes.array.isRequired,
}

const mapStateToProps = (state, ownProps) => {
    const type = getNewMessageType(state)

    return {
        sourceType: type,
        channel: getNewMessageChannel(state),
        getNewMessageSourceProperty: makeGetNewMessageSourceProperty(state),
        allRecipients: getNewMessageRecipients(state),
        availableContactProperties: getContactProperties(type)(state),
        optionalContactProperties: getOptionalContactProperties(type)(state),
        isOpen: ownProps.isOpen || !areNewMessageContactPropertiesFulfilled(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setReceivers: bindActionCreators(ticketActions.setReceivers, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiversDropdown)
