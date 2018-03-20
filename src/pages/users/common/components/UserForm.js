import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import classNames from 'classnames'
import _isUndefined from 'lodash/isUndefined'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _find from 'lodash/find'
import _clone from 'lodash/clone'
import _isError from 'lodash/isError'
import {Form, Button} from 'reactstrap'

import {submitUser} from '../../../../state/users/actions'
import UserChannelFieldArray from './UserChannelFieldArray'
import InputField from '../../../common/forms/InputField'

const defaultContent = {
    name: '',
    role: 'user',
    roles: [{
        name: 'agent',
    }],
    email: [{address: ''}],
    twitter: [{address: ''}],
    phone: [{address: ''}],
    channels: [],
}

const updatableChannels = ['email', 'twitter', 'phone']

class UserForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = _merge({
            submitting: false,
            errors: {},
        }, this._getForm())
    }

    _validate = (values) => {
        let errors = {}

        // validate phones
        if (values.phone && values.phone.length) {
            values.phone.forEach((phone, index) => {
                if (phone.address && !/^\+[\d-\(\) ]+$/.test(phone.address)) {
                    errors['phone'] = errors['phone'] || {}
                    errors['phone'][index] = {'address': 'Please enter an international phone number'}
                }
            })
        }

        return errors
    }

    _updateField = (value) => {
        const newState = Object.assign(_clone(this.state), value)

        this.setState(Object.assign(value, {
            errors: this._validate(newState)
        }))
    }

    _getForm = () => {
        if (this.props.isUpdate) {
            const user = this.props.user.toJS()
            return this._docToForm(_pick(user, Object.keys(defaultContent)))
        }

        return _clone(defaultContent)
    }

    _docToForm = (doc = {}) => {
        const channels = doc.channels || []

        // if the user has a "email" property which is not in its channels, add it as an email channel
        // this should not exist but some users apparently have email in "email" not in "channels"
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
        // ex: email, twitter, etc.
        updatableChannels.forEach((updatableChannel) => {
            doc[updatableChannel] = channels.filter((channel) => channel.type === updatableChannel)

            // if a type of channel has no address, add an empty one
            if (!doc[updatableChannel].length) {
                doc[updatableChannel] = [{
                    channel: updatableChannel,
                    address: ''
                }]
            }
        })

        // display a role even if the user can have multiple ones
        const roles = doc.roles || []
        doc.role = roles.length ? roles[0].name : 'user'

        return doc
    }

    _formToDoc = (form = fromJS({})) => {
        const {user, isUserStaff} = this.props

        let initialChannels = user.get('channels', fromJS([]))
        // put aside channels of currently edited types
        initialChannels = initialChannels.filter((initialChannel) => {
            return !updatableChannels.includes(initialChannel.get('type'))
        })

        // add channels of currently edited types from form
        const channels = updatableChannels.reduce((previousChannels, type) => {
            const formValues = form.get(type) || fromJS([])
            // merging previous channels with new ones
            const addedChannels = formValues
                .map(v => v.set('type', type))
                .filter(v => v.get('address', '').length)
            return previousChannels.toSet().union(addedChannels.toSet()).toList()
        }, initialChannels)

        // remove channels of currently edited types
        let doc = form
        updatableChannels.forEach((channel) => {
            doc = doc.remove(channel)
        })

        // set form channels
        doc = doc.set('channels', channels)

        const formRole = doc.get('role')
        doc = doc.delete('role')
        // if user is staff, do not override is roles
        if (!isUserStaff) {
            // set roles as array
            doc = doc
                .set('roles', fromJS([{name: formRole}]))
        }

        return doc
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        let doc = fromJS(_pick(this.state, Object.keys(defaultContent)))

        let promise

        // if update, set ids for server
        if (this.props.isUpdate) {
            const {user} = this.props
            doc = doc.set('id', user.get('id'))
            promise = this.props.onSubmit(this._formToDoc(doc).toJS(), user.get('id'))
        } else {
            promise = this.props.onSubmit(this._formToDoc(doc).toJS())
        }

        this.setState({
            submitting: true
        })

        return promise.then((response = {}) => {
            this.setState({
                submitting: false
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
        const {isUpdate, isUserStaff} = this.props
        const invalid = Object.keys(this.state.errors).length > 0

        return (
            <Form onSubmit={this._handleSubmit}>
                <div className="mb-2">
                    <InputField
                        type="text"
                        name="name"
                        label="Name"
                        placeholder="John Doe"
                        help="Give a name to the user to make it easier to identify"
                        required
                        value={this.state.name}
                        onChange={name => this._updateField({name})}
                    />

                    {
                        isUserStaff ? (
                                <p>This user is a <b>Gorgias Staff</b> member</p>
                            ) : (
                                <InputField
                                    type="select"
                                    name="role"
                                    label="Role"
                                    required
                                    value={this.state.role}
                                    onChange={role => this._updateField({role})}
                                >
                                    <option value="user">User</option>
                                    <option value="agent">Agent</option>
                                    <option value="admin">Admin</option>
                                </InputField>
                            )
                    }

                    <p>
                        <b>Please set below at least one contact information for this user :</b>
                    </p>

                    <UserChannelFieldArray
                        name="email"
                        type="email"
                        label="Emails"
                        placeholder="john@snow.com"
                        addLabel="Add an email address"
                        meta={{}}
                        fields={this.state.email}
                        onChange={email => this._updateField({email})}
                    />

                    <UserChannelFieldArray
                        name="twitter"
                        label="Twitter accounts"
                        placeholder="johnSnow"
                        addLabel="Add a Twitter account"
                        meta={{}}
                        fields={this.state.twitter}
                        onChange={twitter => this._updateField({twitter})}
                    />

                    <UserChannelFieldArray
                        name="phone"
                        label="Phone numbers"
                        placeholder="+1 111 111 1111"
                        addLabel="Add an phone number"
                        meta={{}}
                        fields={this.state.phone}
                        onChange={phone => this._updateField({phone})}
                        errors={this.state.errors.phone}
                    />
                </div>

                <div className="float-right">
                    <Button
                        type="submit"
                        color="primary"
                        className={classNames({
                            'btn-loading': this.state.submitting
                        })}
                        disabled={this.state.submitting || invalid}
                    >
                        {isUpdate ? 'Update user' : 'Add user'}
                    </Button>
                </div>
            </Form>
        )
    }
}

UserForm.propTypes = {
    isUpdate: PropTypes.bool.isRequired,
    isUserStaff: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    user: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
}

UserForm.defaultProps = {
    user: fromJS({}),
}

const mapStateToProps = (state, ownProps) => {
    const user = ownProps.user || fromJS({})
    return {
        isUpdate: !_isUndefined(user.get('id')),
        isUserStaff: !!user.get('roles', fromJS([])).find(role => role.get('name') === 'staff', null, false)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSubmit: bindActionCreators(submitUser, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserForm)
