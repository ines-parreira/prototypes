import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Field, reduxForm, formValueSelector} from 'redux-form'
import {Button, UncontrolledTooltip} from 'reactstrap'

import Modal from '../Modal'

import {JSONTree} from './../JSONTree'

import {sourceTypeToIcon} from '../../../../config/ticket'
import BinaryChoiceField from './BinaryChoiceField'
import MultiSelectBinaryChoiceField from './MultiSelectBinaryChoiceField'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'
import {isCustomerDataPresent, isCustomerDataValid} from '../infobar/utils'
import ConfirmButton from '../ConfirmButton'

class MergeUsersModal extends React.Component {
    componentDidMount = () => {
        const {sourceUser} = this.props
        const initData = {
            user: this.props.destinationUser.map((v, k) => {
                if (!v) {
                    return sourceUser.get(k)
                }

                return v
            }).toJS()
        }

        initData.user.channels = initData.user.channels.concat(sourceUser.get('channels').toJS())

        this.props.initialize(initData)
    }

    componentWillReceiveProps(nextProps) {
        const {destinationUser, sourceUser} = nextProps
        if (!this.props.isOpen && nextProps.isOpen) {
            logEvent('Opened MergeUsers Modal', {
                destinationUserChannelType: destinationUser.get('channels')
                    .map(channel => channel.get('type'))
                    .toList()
                    .toJS(),
                sourceUser: sourceUser.get('channels')
                    .map(channel => channel.get('type'))
                    .toList()
                    .toJS()
            })
        }
    }

    _handleSubmit = (data) => {
        logEvent('Confirmed MergeUser', {
            finalUser: data.user.channels.map(channel => channel.type)
        })
        return this.props.mergeUsers(
            this.props.destinationUser.get('id'),
            this.props.sourceUser.get('id'),
            data.user
        ).then(() => {
            this._toggle()
        })
    }

    _generateChannelOptions = (user) => {
        return (
            user.get('channels', fromJS([]))
                .filter(channel => !!channel) // removing falsey values
                .map((channel, idx) => ({
                    label: (
                        <div key={idx}>
                            <i className={classnames('mr-2', sourceTypeToIcon(channel.get('type')))} />
                            {channel.get('address')}
                        </div>
                    ),
                    value: channel.toJS()
                }))
                .toList()
                .toJS()
        )
    }

    _toggle = () => {
        this.props.toggleModal(false)
    }

    render() {
        const {destinationUser, sourceUser, handleSubmit, isLoading, primaryEmail, requiredAddresses} = this.props

        let baseCustomer = destinationUser.get('customer') || fromJS({})

        if (isCustomerDataValid(baseCustomer)) {
            baseCustomer = baseCustomer.delete('_shopify')
        }

        baseCustomer = isCustomerDataPresent(baseCustomer) ? baseCustomer.toJS() : {}
        let mergeCustomer = sourceUser.get('customer') || fromJS({})

        if (isCustomerDataValid(mergeCustomer)) {
            mergeCustomer = mergeCustomer.delete('_shopify')
        }

        mergeCustomer = isCustomerDataPresent(mergeCustomer) ? mergeCustomer.toJS() : {}

        const allChannels = destinationUser.get('channels').toJS().concat(sourceUser.get('channels').toJS())

        const allRequiredAddresses = requiredAddresses.toJS()
        allRequiredAddresses.push(primaryEmail)

        const requiredChannelValues = allChannels.filter(
            (channel) => allRequiredAddresses.includes(channel.address)
        )

        return (
            <Modal
                isOpen={this.props.isOpen}
                onClose={this._toggle}
                className="MergeUsersModal"
                size="lg"
                header="Merge users"
            >
                <form
                    className="ui form"
                    onSubmit={handleSubmit(this._handleSubmit)}
                >
                    <div className="content">
                        <p className="merge-instructions">
                            Select what data you want to keep, then click the "Merge Users" button.
                            The fields in blue will be kept.
                        </p>
                        <Field
                            label="Name"
                            name="user.name"
                            component={BinaryChoiceField}
                            options={[
                                {
                                    label: (
                                        <span>
                                            <i className="fa fa-fw fa-user mr-2" />
                                            {destinationUser.get('name')}
                                        </span>
                                    ),
                                    value: destinationUser.get('name') || ''
                                },
                                {
                                    label: (
                                        <span>
                                            <i className="fa fa-fw fa-user mr-2" />
                                            {sourceUser.get('name')}
                                        </span>
                                    ),
                                    value: sourceUser.get('name') || ''
                                }
                            ]}
                        />
                        <Field
                            label="Primary email"
                            name="user.email"
                            component={BinaryChoiceField}
                            tooltip={(
                                <span>
                                        <i
                                            id="merge-primary-email"
                                            className="fa fa-fw fa-question-circle ml-2"
                                        />
                                        <UncontrolledTooltip
                                            placement="top"
                                            target="merge-primary-email"
                                            delay={0}
                                        >
                                            This is the email address which will be used to fetch data for the user
                                        </UncontrolledTooltip>
                                    </span>
                            )}
                            options={[
                                {
                                    label: (
                                        <span>
                                            <i className={classnames('mr-2', sourceTypeToIcon('email'))} />
                                            {destinationUser.get('email')}
                                        </span>
                                    ),
                                    value: destinationUser.get('email') || ''
                                },
                                {
                                    label: (
                                        <span>
                                            <i className={classnames('mr-2', sourceTypeToIcon('email'))} />
                                            {sourceUser.get('email')}
                                        </span>
                                    ),
                                    value: sourceUser.get('email') || ''
                                }
                            ]}
                        />
                        <Field
                            label="Contact info"
                            tooltip={(
                                <span>
                                    <i
                                        id="merge-contact-info"
                                        className="fa fa-fw fa-question-circle ml-2"
                                    />
                                    <UncontrolledTooltip
                                        placement="top"
                                        target="merge-contact-info"
                                        delay={0}
                                    >
                                        You can not deselect the contact info associated with the primary email
                                    </UncontrolledTooltip>
                                </span>
                            )}
                            name="user.channels"
                            component={MultiSelectBinaryChoiceField}
                            requiredValues={requiredChannelValues}
                            options={[
                                this._generateChannelOptions(destinationUser),
                                this._generateChannelOptions(sourceUser)
                            ]}
                            propertiesToCompare={['address', 'type']}
                        />
                        <Field
                            type="json"
                            label="Customer data"
                            name="user.customer"
                            component={BinaryChoiceField}
                            options={[
                                {
                                    label: <JSONTree data={fromJS(baseCustomer)} />,
                                    value: baseCustomer
                                },
                                {
                                    label: <JSONTree data={fromJS(mergeCustomer)} />,
                                    value: mergeCustomer
                                }
                            ]}
                        />
                    </div>

                    <div className="pull-right buttons-bar">
                        <Button
                            color="secondary"
                            type="button"
                            className="mr-2"
                            onClick={this._toggle}
                        >
                            Cancel
                        </Button>

                        <ConfirmButton
                            color="success"
                            type="submit"
                            loading={isLoading}
                            content="This action is irreversible. Are you sure you want to merge those users?"
                        >
                            Merge users
                        </ConfirmButton>
                    </div>
                </form>
            </Modal>
        )
    }
}

MergeUsersModal.propTypes = {
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    destinationUser: PropTypes.object.isRequired,
    sourceUser: PropTypes.object.isRequired,
    mergeUsers: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    primaryEmail: PropTypes.string,
    requiredAddresses: PropTypes.object
}

const selector = formValueSelector('mergeUsersForm')

const mapStateToProps = (state) => ({
    primaryEmail: selector(state, 'user.email')
})

export default connect(mapStateToProps)(
    reduxForm({
        form: 'mergeUsersForm',
    })(MergeUsersModal)
)

