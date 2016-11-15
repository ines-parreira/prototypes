import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Field, reduxForm, formValueSelector} from 'redux-form'
import classNames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import {JSONTree} from './../JSONTree'
import {USER_CHANNEL_CLASS} from './../../../../config'
import BinaryChoiceField from './../formFields/BinaryChoiceField'
import MultiSelectBinaryChoiceField from './../formFields/MultiSelectBinaryChoiceField'


class MergeUsersModal extends React.Component {
    componentDidMount = () => {
        const initData = {
            user: this.props.destinationUser.map((v, k) => {
                if (!v) {
                    return this.props.sourceUser.get(k)
                }

                return v
            }).toJS()
        }

        initData.user.channels = initData.user.channels.concat(this.props.sourceUser.get('channels').toJS())

        this.props.initialize(initData)

        $(this.refs.mergeUsersModal).modal({
            onHidden: this._closeModal
        }).modal('show')

        $(this.refs.emailTooltip).popup({
            inline: true,
            position: 'top left',
            offset: -10
        })

        $(this.refs.contactTooltip).popup({
            inline: true,
            position: 'top left',
            offset: -10
        })
    }

    componentWillUnmount = () => {
        $(this.refs.mergeUsersModal).modal('hide')
    }

    _handleSubmit = (data) => {
        // submit user to merge
        if (confirm('This action is irreversible. Are you sure you want to merge those users?')) {
            this.props.mergeUsers(
                this.props.destinationUser.get('id'),
                this.props.sourceUser.get('id'),
                data.user
            )
        }
        return false
    }

    _generateChannelOptions = (user) => (
        user.get('channels').map((channel, idx) => ({
            label: (
                <div key={idx}>
                    <i className={USER_CHANNEL_CLASS[channel.get('type')]}/> {channel.get('address')}
                </div>
            ),
            value: channel.toJS()
        }))
            .toList()
            .toJS()
    )

    _closeModal = () => {
        this.props.toggleModal(false)
    }

    render() {
        const {destinationUser, sourceUser, handleSubmit, isLoading, primaryEmail} = this.props

        const buttonClassName = classNames('ui orange button', {loading: isLoading, disabled: isLoading})

        const baseCustomer = (destinationUser.get('customer') || fromJS({})).toJS()
        const mergeCustomer = (sourceUser.get('customer') || fromJS({})).toJS()

        const emailTooltipText = 'This is the email address which will be used to fetch data for the user.'
        const contactTooltipText = 'You can\'t unselect the contact info associated with the primary email.'

        const allChannels = destinationUser.get('channels').toJS().concat(sourceUser.get('channels').toJS())
        const requiredChannelValue = allChannels.find(channel => channel.address === primaryEmail)

        return (
            <div
                ref="mergeUsersModal"
                className="MergeUsersModal ui large modal"
            >
                <i className="close icon" />
                <div className="header">
                    Merge users
                </div>
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
                                    label: <span><i className="user icon"/>{destinationUser.get('name') || ''}</span>,
                                    value: destinationUser.get('name') || ''
                                },
                                {
                                    label: <span><i className="user icon"/>{sourceUser.get('name') || ''}</span>,
                                    value: sourceUser.get('name') || ''
                                }
                            ]}
                        />
                        <Field
                            label="Primary email"
                            name="user.email"
                            component={BinaryChoiceField}
                            tooltip={(
                                <span
                                    ref="emailTooltip"
                                    className="tooltip"
                                    data-content={emailTooltipText}
                                    data-variation="wide inverted"
                                >
                                    <i className="help circle link icon"/>
                                </span>
                            )}
                            options={[
                                {
                                    label: <span><i className="mail icon"/>{destinationUser.get('email') || ''}</span>,
                                    value: destinationUser.get('email') || ''
                                },
                                {
                                    label: <span><i className="mail icon"/>{sourceUser.get('email') || ''}</span>,
                                    value: sourceUser.get('email') || ''
                                }
                            ]}
                        />
                        <Field
                            label="Contact info"
                            tooltip={(
                                <span
                                    ref="contactTooltip"
                                    className="tooltip"
                                    data-content={contactTooltipText}
                                    data-variation="wide inverted"
                                >
                                    <i className="help circle link icon"/>
                                </span>
                            )}
                            name="user.channels"
                            component={MultiSelectBinaryChoiceField}
                            requiredValue={requiredChannelValue}
                            options={[
                                this._generateChannelOptions(destinationUser),
                                this._generateChannelOptions(sourceUser)
                            ]}
                        />
                        <Field
                            type="json"
                            label="Customer data"
                            name="user.customer"
                            component={BinaryChoiceField}
                            options={[
                                {
                                    label: <JSONTree data={destinationUser.get('customer')}/>,
                                    value: _isEmpty(baseCustomer) ? null : baseCustomer
                                },
                                {
                                    label: <JSONTree data={sourceUser.get('customer')}/>,
                                    value: _isEmpty(mergeCustomer) ? null : mergeCustomer
                                }
                            ]}
                        />
                    </div>

                    <div className="footer">
                        <div className="ui right floated buttons-bar">
                            <div
                                className="ui basic grey button"
                                onClick={this._closeModal}
                            >
                                Cancel
                            </div>
                            <button type="submit" className={buttonClassName}>
                                Merge users
                            </button>
                        </div>
                    </div>
                </form>
            </div>
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
    isLoading: PropTypes.bool.isRequired,
    primaryEmail: PropTypes.string
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

