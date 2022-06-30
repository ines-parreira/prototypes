import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import _isUndefined from 'lodash/isUndefined'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _find from 'lodash/find'
import _clone from 'lodash/clone'
import _isError from 'lodash/isError'
import {Form} from 'reactstrap'

import CustomerChannelFieldArray from './CustomerChannelFieldArray'
import css from './CustomerForm.less'

import Button from 'pages/common/components/button/Button.tsx'
import InputField from 'pages/common/forms/input/InputField'
import TextArea from 'pages/common/forms/TextArea'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {submitCustomer} from 'state/customers/actions.ts'

const defaultContent = {
    name: '',
    note: '',
    email: [{address: ''}],
    phone: [{address: ''}],
    channels: [],
}

const updatableChannels = ['email', 'phone']

class CustomerForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = _merge(
            {
                submitting: false,
                errors: {},
            },
            this._getForm()
        )
    }

    _validate = (values) => {
        let errors = {}

        // validate phones
        if (values.phone && values.phone.length) {
            values.phone.forEach((phone, index) => {
                if (phone.address && !/^\+[\d-\(\) ]+$/.test(phone.address)) {
                    errors['phone'] = errors['phone'] || {}
                    errors['phone'][index] = {
                        address: 'Please enter an international phone number',
                    }
                }
            })
        }

        return errors
    }

    _updateField = (value) => {
        const newState = Object.assign(_clone(this.state), value)

        this.setState(
            Object.assign(value, {
                errors: this._validate(newState),
            })
        )
    }

    _getForm = () => {
        if (this.props.isUpdate) {
            const customer = this.props.customer.toJS()
            return this._docToForm(_pick(customer, Object.keys(defaultContent)))
        }

        return _clone(defaultContent)
    }

    _docToForm = (doc = {}) => {
        const channels = doc.channels || []

        // if the customer has a "email" property which is not in its channels, add it as an email channel
        // this should not exist but some customers apparently have email in "email" not in "channels"
        const email = doc.email
        if (email) {
            const hasEmailAsChannel = _find(channels, {address: email})
            if (!hasEmailAsChannel) {
                channels.push({
                    type: 'email',
                    address: email,
                })
            }
        }

        // divide channels by their types in separated groups
        // ex: email, phone, etc.
        updatableChannels.forEach((updatableChannel) => {
            doc[updatableChannel] = channels.filter(
                (channel) => channel.type === updatableChannel
            )

            // if a type of channel has no address, add an empty one
            if (!doc[updatableChannel].length) {
                doc[updatableChannel] = [
                    {
                        channel: updatableChannel,
                        address: '',
                    },
                ]
            }
        })

        return doc
    }

    _formToDoc = (form = fromJS({})) => {
        const {customer} = this.props

        let initialChannels = customer.get('channels', fromJS([]))
        // put aside channels of currently edited types
        initialChannels = initialChannels.filter((initialChannel) => {
            return !updatableChannels.includes(initialChannel.get('type'))
        })

        // add channels of currently edited types from form
        const channels = updatableChannels.reduce((previousChannels, type) => {
            const formValues = form.get(type) || fromJS([])
            // merging previous channels with new ones
            const addedChannels = formValues
                .map((v) => v.set('type', type))
                .filter((v) => v.get('address', '').length)
            return previousChannels
                .toSet()
                .union(addedChannels.toSet())
                .toList()
        }, initialChannels)

        // remove channels of currently edited types
        let doc = form
        updatableChannels.forEach((channel) => {
            doc = doc.remove(channel)
        })

        // set form channels
        doc = doc.set('channels', channels)

        return doc
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        let doc = fromJS(_pick(this.state, Object.keys(defaultContent)))

        let promise

        // if update, set ids for server
        if (this.props.isUpdate) {
            const {customer} = this.props
            doc = doc.set('id', customer.get('id'))
            promise = this.props.onSubmit(
                this._formToDoc(doc).toJS(),
                customer.get('id')
            )
        } else {
            promise = this.props.onSubmit(this._formToDoc(doc).toJS())
        }

        this.setState({
            submitting: true,
        })

        return promise.then((response = {}) => {
            this.setState({
                submitting: false,
            })

            if (response.error || _isError(response)) {
                return
            }

            if (this.props.onSuccess) {
                this.props.onSuccess()
            }

            this.props.closeModal()
        })
    }

    render() {
        const {isUpdate} = this.props
        const invalid = Object.keys(this.state.errors).length > 0

        return (
            <Form onSubmit={this._handleSubmit}>
                <ModalBody>
                    <div className="mb-2">
                        <InputField
                            className={css.field}
                            id="name"
                            label="Name"
                            placeholder="John Doe"
                            caption="Give a name to the customer to make it easier to identify"
                            isRequired
                            value={this.state.name}
                            onChange={(name) => this._updateField({name})}
                            error={this.state.errors.name}
                        />
                        <TextArea
                            className={css.field}
                            id="note"
                            label="Note"
                            placeholder="This customer is nice."
                            rows="3"
                            value={this.state.note}
                            onChange={(note) => this._updateField({note})}
                        />
                        <p>
                            <b>
                                Please set below at least one contact
                                information for this customer :
                            </b>
                        </p>
                        <CustomerChannelFieldArray
                            name="email"
                            type="email"
                            label="Emails"
                            placeholder="john@snow.com"
                            addLabel="Add an email address"
                            meta={{}}
                            fields={this.state.email}
                            onChange={(email) => this._updateField({email})}
                        />
                        <CustomerChannelFieldArray
                            name="phone"
                            label="Phone numbers"
                            placeholder="+1 111 111 1111"
                            addLabel="Add a phone number"
                            meta={{}}
                            fields={this.state.phone}
                            onChange={(phone) => this._updateField({phone})}
                            errors={this.state.errors.phone}
                        />
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        type="submit"
                        isDisabled={this.state.submitting || invalid}
                        isLoading={this.state.submitting}
                    >
                        {isUpdate ? 'Update customer' : 'Add customer'}
                    </Button>
                </ModalActionsFooter>
            </Form>
        )
    }
}

CustomerForm.propTypes = {
    isUpdate: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    customer: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
}

CustomerForm.defaultProps = {
    customer: fromJS({}),
}

const mapStateToProps = (state, ownProps) => {
    const customer = ownProps.customer || fromJS({})
    return {
        isUpdate: !_isUndefined(customer.get('id')),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSubmit: bindActionCreators(submitCustomer, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerForm)
