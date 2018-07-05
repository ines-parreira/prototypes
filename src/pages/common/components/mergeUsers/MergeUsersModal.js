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

class MergeUsersModal extends React.Component {
    state = _clone(defaultContent)

    componentDidMount = () => {
        const {sourceUser} = this.props
        const initData = this.props.destinationUser.map((v, k) => {
            if (!v) {
                return sourceUser.get(k)
            }

            return v
        }).toJS()

        initData.channels = initData.channels.concat(sourceUser.get('channels').toJS())

        this.setState(_pick(initData, Object.keys(defaultContent)))
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            segmentTracker.logEvent(segmentTracker.EVENTS.MODAL_TOGGLED, {
                open: true,
                name: 'merge users',
            })
        }
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            user: _pick(this.state, Object.keys(defaultContent))
        }

        return this.props.mergeCustomers(
            this.props.destinationUser.get('id'),
            this.props.sourceUser.get('id'),
            data.user
        ).then(({error}) => {
            this._toggle()

            if (!error && this.props.onSuccess) {
                this.props.onSuccess()
            }
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
        const {destinationUser, sourceUser, isLoading, requiredAddresses} = this.props
        const primaryEmail = this.state.email

        let baseCustomerData = destinationUser.get('data') || fromJS({})

        if (isCustomerDataValid(baseCustomerData)) {
            baseCustomerData = baseCustomerData.delete('_shopify')
        }

        baseCustomerData = isCustomerDataPresent(baseCustomerData) ? baseCustomerData.toJS() : {}
        let mergeCustomerData = sourceUser.get('data') || fromJS({})

        if (isCustomerDataValid(mergeCustomerData)) {
            mergeCustomerData = mergeCustomerData.delete('_shopify')
        }

        mergeCustomerData = isCustomerDataPresent(mergeCustomerData) ? mergeCustomerData.toJS() : {}

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
                size="lg"
                header="Merge users"
            >
                <Form onSubmit={this._handleSubmit}>
                    <div className="content">
                        <p className="merge-instructions">
                            Select what data you want to keep, then click the "Merge Users" button.
                            The fields in blue will be kept.
                        </p>
                        <BinaryChoiceField
                            label="Name"
                            name="user.name"
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
                            value={this.state.name}
                            onChange={name => this.setState({name})}
                        />
                        <BinaryChoiceField
                            label="Primary email"
                            name="user.email"
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
                                            This is the email address which will be used to fetch data for the user
                                        </Tooltip>
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
                            name="user.channels"
                            requiredValues={requiredChannelValues}
                            options={[
                                this._generateChannelOptions(destinationUser),
                                this._generateChannelOptions(sourceUser)
                            ]}
                            propertiesToCompare={['address', 'type']}
                            value={this.state.channels}
                            onChange={channels => this.setState({channels})}
                        />
                        <BinaryChoiceField
                            label="Customer data"
                            name="user.data"
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
                            content="This action is irreversible. Are you sure you want to merge those users?"
                        >
                            Merge users
                        </ConfirmButton>
                    </div>
                </Form>
            </Modal>
        )
    }
}

MergeUsersModal.propTypes = {
    destinationUser: PropTypes.object.isRequired,
    sourceUser: PropTypes.object.isRequired,
    mergeCustomers: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    isOpen: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    primaryEmail: PropTypes.string,
    requiredAddresses: PropTypes.object
}

export default MergeUsersModal

