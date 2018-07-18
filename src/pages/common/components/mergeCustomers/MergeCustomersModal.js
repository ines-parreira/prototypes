import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _clone from 'lodash/clone'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import {Button, Form} from 'reactstrap'

import Modal from '../Modal'

import {JSONTree} from './../JSONTree'

import {sourceTypeToIcon} from '../../../../config/ticket'
import BinaryChoiceField from './BinaryChoiceField'
import MultiSelectBinaryChoiceField from './MultiSelectBinaryChoiceField'
import {isCustomerDataPresent, isCustomerDataValid} from '../infobar/utils'
import ConfirmButton from '../ConfirmButton'
import Tooltip from '../Tooltip'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'

const defaultContent = {
    name: '',
    email: '',
    data: {},
    channels: []
}

class MergeCustomersModal extends React.Component {
    state = _clone(defaultContent)

    componentDidMount = () => {
        const {sourceCustomer} = this.props
        const initData = this.props.destinationCustomer.map((v, k) => {
            if (!v) {
                return sourceCustomer.get(k)
            }

            return v
        }).toJS()

        initData.channels = initData.channels.concat(sourceCustomer.get('channels').toJS())

        this.setState(_pick(initData, Object.keys(defaultContent)))
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            // TODO(customers-migration): ask confirmation to update this event
            segmentTracker.logEvent(segmentTracker.EVENTS.MODAL_TOGGLED, {
                open: true,
                name: 'merge users',
            })
        }
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            customer: _pick(this.state, Object.keys(defaultContent))
        }

        return this.props.mergeCustomers(
            this.props.destinationCustomer.get('id'),
            this.props.sourceCustomer.get('id'),
            data.customer
        ).then(({error}) => {
            this._toggle()

            if (!error && this.props.onSuccess) {
                this.props.onSuccess()
            }
        })
    }

    _generateChannelOptions = (customer) => {
        return (
            customer.get('channels', fromJS([]))
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
        const {destinationCustomer, sourceCustomer, isLoading, requiredAddresses} = this.props
        const primaryEmail = this.state.email

        let baseCustomerData = destinationCustomer.get('data') || fromJS({})

        if (isCustomerDataValid(baseCustomerData)) {
            baseCustomerData = baseCustomerData.delete('_shopify')
        }

        baseCustomerData = isCustomerDataPresent(baseCustomerData) ? baseCustomerData.toJS() : {}
        let mergeCustomerData = sourceCustomer.get('data') || fromJS({})

        if (isCustomerDataValid(mergeCustomerData)) {
            mergeCustomerData = mergeCustomerData.delete('_shopify')
        }

        mergeCustomerData = isCustomerDataPresent(mergeCustomerData) ? mergeCustomerData.toJS() : {}

        const allChannels = destinationCustomer.get('channels').toJS().concat(sourceCustomer.get('channels').toJS())

        const allRequiredAddresses = requiredAddresses.toJS()
        allRequiredAddresses.push(primaryEmail)

        const requiredChannelValues = allChannels.filter(
            (channel) => allRequiredAddresses.includes(channel.address)
        )

        return (
            <Modal
                isOpen={this.props.isOpen}
                onClose={this._toggle}
                size="lg"
                header="Merge customers"
            >
                <Form onSubmit={this._handleSubmit}>
                    <div className="content">
                        <p className="merge-instructions">
                            Select what data you want to keep, then click the "Merge Customers" button.
                            The fields in blue will be kept.
                        </p>
                        <BinaryChoiceField
                            label="Name"
                            name="customer.name"
                            options={[
                                {
                                    label: (
                                        <span>
                                            <i className="fa fa-fw fa-user mr-2" />
                                            {destinationCustomer.get('name')}
                                        </span>
                                    ),
                                    value: destinationCustomer.get('name') || ''
                                },
                                {
                                    label: (
                                        <span>
                                            <i className="fa fa-fw fa-user mr-2" />
                                            {sourceCustomer.get('name')}
                                        </span>
                                    ),
                                    value: sourceCustomer.get('name') || ''
                                }
                            ]}
                            value={this.state.name}
                            onChange={name => this.setState({name})}
                        />
                        <BinaryChoiceField
                            label="Primary email"
                            name="customer.email"
                            tooltip={(
                                <span>
                                        <i
                                            id="merge-primary-email"
                                            className="fa fa-fw fa-question-circle ml-2"
                                        />
                                        <Tooltip
                                            placement="top"
                                            target="merge-primary-email"
                                        >
                                            This is the email address which will be used to fetch data for the customer
                                        </Tooltip>
                                    </span>
                            )}
                            options={[
                                {
                                    label: (
                                        <span>
                                            <i className={classnames('mr-2', sourceTypeToIcon('email'))} />
                                            {destinationCustomer.get('email')}
                                        </span>
                                    ),
                                    value: destinationCustomer.get('email') || ''
                                },
                                {
                                    label: (
                                        <span>
                                            <i className={classnames('mr-2', sourceTypeToIcon('email'))} />
                                            {sourceCustomer.get('email')}
                                        </span>
                                    ),
                                    value: sourceCustomer.get('email') || ''
                                }
                            ]}
                            value={this.state.email}
                            onChange={email => this.setState({email})}
                        />
                        <MultiSelectBinaryChoiceField
                            label="Contact info"
                            tooltip={(
                                <span>
                                    <i
                                        id="merge-contact-info"
                                        className="fa fa-fw fa-question-circle ml-2"
                                    />
                                    <Tooltip
                                        placement="top"
                                        target="merge-contact-info"
                                    >
                                        You can not deselect the contact info associated with the primary email
                                    </Tooltip>
                                </span>
                            )}
                            name="customer.channels"
                            requiredValues={requiredChannelValues}
                            options={[
                                this._generateChannelOptions(destinationCustomer),
                                this._generateChannelOptions(sourceCustomer)
                            ]}
                            propertiesToCompare={['address', 'type']}
                            value={this.state.channels}
                            onChange={channels => this.setState({channels})}
                        />
                        <BinaryChoiceField
                            label="Customer data"
                            name="customer.data"
                            options={[
                                {
                                    label: <JSONTree data={fromJS(baseCustomerData)} />,
                                    value: baseCustomerData
                                },
                                {
                                    label: <JSONTree data={fromJS(mergeCustomerData)} />,
                                    value: mergeCustomerData
                                }
                            ]}
                            value={_omit(this.state.data, ['_shopify'])}
                            onChange={data => this.setState({data})}
                        />
                    </div>

                    <div className="float-right buttons-bar">
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
                            content="This action is irreversible. Are you sure you want to merge those customers?"
                        >
                            Merge customers
                        </ConfirmButton>
                    </div>
                </Form>
            </Modal>
        )
    }
}

MergeCustomersModal.propTypes = {
    destinationCustomer: PropTypes.object.isRequired,
    sourceCustomer: PropTypes.object.isRequired,
    mergeCustomers: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    isOpen: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    primaryEmail: PropTypes.string,
    requiredAddresses: PropTypes.object
}

export default MergeCustomersModal

