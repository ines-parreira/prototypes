import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import ReceiversSelectField from './components/ReceiversSelectField'
import SenderSelectField from './components/SenderSelectField/index'
import * as newMessageActions from '../../../../../../state/newMessage/actions'
import {
    getNewMessageType,
    getNewMessageChannel,
    makeGetNewMessageSourceProperty,
    getNewMessageRecipients,
    getContactProperties,
    getOptionalContactProperties,
    areNewMessageContactPropertiesFulfilled,
} from '../../../../../../state/newMessage/selectors'
import * as integrationSelectors from '../../../../../../state/integrations/selectors'
import {displayUserNameFromSource} from '../../../../common/utils'
import _upperFirst from 'lodash/upperFirst'
import _uniq from 'lodash/uniq'
import _difference from 'lodash/difference'
import _xor from 'lodash/xor'

class MessageSourceFields extends React.Component {
    state = {
        displayedFields: [], // optional fields that are displayed
    }

    componentWillReceiveProps(nextProps) {
        const {isOpen: wasOpen, isNewTicket} = this.props
        const {isOpen} = nextProps
        const {displayedFields} = this.state
        const hasFromField = displayedFields.includes('from')

        // display `from` field on new ticket creation
        if (isNewTicket && !hasFromField) {
            this.setState({displayedFields: displayedFields.concat(['from'])})
        }
        // if closing or opening, recalculating optional fields that we want to keep open
        if (wasOpen !== isOpen) {
            this._openUsedOptionalFields()
        }
    }

    /**
     * Remember currently used fields as open
     * @private
     */
    _openUsedOptionalFields = () => {
        const {
            getNewMessageSourceProperty,
            availableContactProperties,
        } = this.props

        // remove unused fields from optional ones
        const displayedOptionalFields = availableContactProperties.filter((r) => !getNewMessageSourceProperty(r).isEmpty())

        this.setState({
            displayedFields: displayedOptionalFields,
        })
    }

    _toggleOptionalField = (field) => {
        this.setState({
            displayedFields: _xor(this.state.displayedFields, [field]),
        })
    }

    _renderOpened = () => {
        const {
            accountChannels,
            sourceType,
            enabled,
            channel,
            parentId,
            getNewMessageSourceProperty,
            setReceivers,
            setSender,
            availableContactProperties,
            optionalContactProperties,
        } = this.props

        // fields that are displayed by default
        const mandatoryFields = availableContactProperties.filter(r => !optionalContactProperties.includes(r))

        // available optional fields, depends on the fields configuration above (depends on source type or channel)
        const availableOptionalFields = availableContactProperties.filter(r => optionalContactProperties.includes(r))

        // selected optional fields or fields already containing data
        const displayedOptionalFields = availableOptionalFields.filter((r) => {
            return this.state.displayedFields.includes(r) || !getNewMessageSourceProperty(r).isEmpty()
        })

        // remaining optional fields not already displayed
        const remainingOptionalFields = _difference(availableOptionalFields, displayedOptionalFields)

        // final displayed fields
        const displayedFields = _uniq(mandatoryFields.concat(displayedOptionalFields))

        const from = getNewMessageSourceProperty('from').toJS()

        return (
            <div>
                {
                    // display fields
                    displayedFields.map((prop) => {
                        let value = getNewMessageSourceProperty(prop)

                        value = value.isEmpty() ? [] : value.toJS()

                        return (
                            <div
                                key={prop}
                                className="message-source-field"
                            >
                                <span className="label">{_upperFirst(prop)}: </span>
                                <ReceiversSelectField
                                    parentId={parentId}
                                    sourceType={sourceType}
                                    channel={channel}
                                    disabled={!enabled}
                                    required={mandatoryFields.includes(prop)}
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
                    from && (
                        <div
                            key="from"
                            className="message-source-field"
                        >
                            <span className="label">From: </span>
                            <SenderSelectField
                                channels={accountChannels}
                                input={{
                                    value: from.address,
                                    onChange({target}) {
                                        setSender(target.value)
                                    },
                                }}
                            />
                        </div>
                    )
                }
                {
                    // display buttons for optional fields
                    !!remainingOptionalFields.length && (
                        <div className="optional-fields">
                            {
                                remainingOptionalFields.map((prop, index) => (
                                    <span key={prop}>
                                        <span
                                            className="optional-field"
                                            onClick={(e) => {
                                                e.stopPropagation() // prevent the edit window from closing
                                                this._toggleOptionalField(prop)
                                            }}
                                        >
                                            {_upperFirst(prop)}
                                        </span>
                                        {(index < remainingOptionalFields.length - 1) && ' / '}
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
            <div className="message-source-field">
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
            <div className="message-source-fields">
                {this.props.isOpen ? this._renderOpened() : this._renderClosed()}
            </div>
        )
    }
}

MessageSourceFields.propTypes = {
    accountChannels: PropTypes.object.isRequired,
    setSender: PropTypes.func.isRequired,
    setReceivers: PropTypes.func.isRequired,
    initialValues: PropTypes.object.isRequired, // the values which should populate the field when it mounts

    getNewMessageSourceProperty: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired, // whether the dropdown should allow user interactions or not
    parentId: PropTypes.string.isRequired, // the id of the parent object, to check if the field needs to be repopulated

    sourceType: PropTypes.string.isRequired,
    channel: PropTypes.string.isRequired,
    allRecipients: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isNewTicket: PropTypes.bool.isRequired,
    canOpen: PropTypes.bool.isRequired,
    availableContactProperties: PropTypes.array.isRequired,
    optionalContactProperties: PropTypes.array.isRequired,
}

const mapStateToProps = (state, ownProps) => {
    const type = getNewMessageType(state)

    return {
        isNewTicket: !state.ticket.get('id'),
        sourceType: type,
        accountChannels: integrationSelectors.getChannels(state),
        channel: getNewMessageChannel(state),
        getNewMessageSourceProperty: makeGetNewMessageSourceProperty(state),
        allRecipients: getNewMessageRecipients(state),
        availableContactProperties: getContactProperties(type)(state),
        optionalContactProperties: getOptionalContactProperties(type)(state),
        isOpen: ownProps.isOpen || !areNewMessageContactPropertiesFulfilled(state)
    }
}

const mapDispatchToProps = {
    setSender: newMessageActions.setSender,
    setReceivers: newMessageActions.setReceivers,
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageSourceFields)
