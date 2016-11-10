import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {Field, FieldArray, reduxForm} from 'redux-form'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import classNames from 'classnames'
import _isUndefined from 'lodash/isUndefined'
import _isError from 'lodash/isError'
import _find from 'lodash/find'
import _clone from 'lodash/clone'
import {submitUser} from '../../../../state/users/actions'
import {InputField, SelectField} from '../../../common/components/formFields'
import UserChannelAddressField from './UserChannelAddressField'

export const defaultContent = {
    roles: [{
        name: 'agent',
    }],
}

const updatableChannels = ['email', 'twitter', 'phone']

const warn = (values = {}) => {
    const warnings = {}

    if (!values.name) {
        warnings.name = 'You should give a name to the user, to make it easier to identify'
    }

    return warnings
}

class UserForm extends React.Component {
    constructor(props) {
        super(props)

        this.isInitialized = !props.isUpdate

        this._initializeForm()
    }

    componentWillUpdate() {
        if (!this.isInitialized && this.props.isUpdate) {
            this._initializeForm()
        }
    }

    _initializeForm = () => {
        if (this.props.isUpdate) {
            this._initializeWithData(this.props.user.toJS())
        } else {
            this._initializeWithData(_clone(defaultContent))
        }
    }

    _initializeWithData = (data) => {
        this.props.initialize(this._docToForm(data))
        this.isInitialized = true
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

    _handleSubmit = (values) => {
        let doc = fromJS(values)

        let promise

        // if update, set ids for server
        if (this.props.isUpdate) {
            const {user} = this.props
            doc = doc.set('id', user.get('id'))
            promise = this.props.onSubmit(this._formToDoc(doc).toJS(), user.get('id'))
        } else {
            promise = this.props.onSubmit(this._formToDoc(doc).toJS())
        }

        return promise.then((response) => {
            if (!_isError(response)) {
                if (this.props.onSuccess) {
                    this.props.onSuccess()
                }

                this.props.closeModal()
            }
        })
    }

    render() {
        const {handleSubmit, user, isUpdate, isUserStaff, submitting} = this.props

        const title = isUpdate ? `Update user : ${user.get('name')}` : 'Add user'

        return (
            <div ref="modal">
                <div className="header">
                    {title}
                    <i
                        className="remove action icon modal-close"
                        onClick={this.props.closeModal}
                    />
                </div>

                <form
                    className="ui form"
                    onSubmit={handleSubmit(this._handleSubmit)}
                >
                    <div className="content">
                        <Field
                            name="name"
                            label="Name"
                            placeholder="Name"
                            component={InputField}
                        />

                        {
                            isUserStaff ? (
                                <p>This user is a <b>Gorgias Staff</b> member</p>
                            ) : (
                                <Field
                                    type="text"
                                    name="role"
                                    label="Role"
                                    required
                                    component={SelectField}
                                >
                                    <option value="user">User</option>
                                    <option value="agent">Agent</option>
                                    <option value="admin">Admin</option>
                                </Field>
                            )
                        }

                        <p><b>Please set below at least one contact information for this user</b></p>

                        <FieldArray
                            name="email"
                            type="email"
                            label="Emails"
                            placeholder="john@snow.com"
                            addLabel="Add an email address"
                            component={UserChannelAddressField}
                        />

                        <FieldArray
                            name="twitter"
                            label="Twitter accounts"
                            placeholder="johnSnow"
                            addLabel="Add a Twitter account"
                            component={UserChannelAddressField}
                        />

                        <FieldArray
                            name="phone"
                            label="Phone numbers"
                            placeholder="754-3010"
                            addLabel="Add an phone number"
                            component={UserChannelAddressField}
                        />
                    </div>

                    <div className="actions">
                        <div className="field">
                            <button
                                type="submit"
                                className={classNames('ui', 'green', 'button', {
                                    loading: submitting
                                })}
                                disabled={submitting}
                            >
                                {isUpdate ? 'Update user' : 'Add user'}
                            </button>
                            <button
                                type="button"
                                className={classNames('ui', 'button', {
                                    loading: submitting
                                })}
                                disabled={submitting}
                                onClick={this.props.closeModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

UserForm.propTypes = {
    initialize: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    destroy: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
    form: 'user',
    warn,
})(UserForm))
