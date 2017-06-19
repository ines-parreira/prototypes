import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'
import moment from 'moment-timezone'
import {Form, FormGroup, Button} from 'reactstrap'

import {AVAILABLE_LANGUAGES} from './../../../../config'
import formSender from '../../../common/utils/formSender'

import ReduxFormInputField from '../../../common/forms/ReduxFormInputField'
import BooleanField from '../../../common/forms/BooleanField'
import RichField from '../../../common/forms/RichField'

class YourProfileView extends React.Component {
    constructor(props) {
        super(props)

        this.isInitialized = false
        this.state = {
            loadingPreferences: false,
            preferences: props.preferences.get('data')
        }

        if (!props.currentUser.isEmpty()) {
            this._init(props)
        }
    }

    componentWillUpdate(nextProps) {
        if (!this.isInitialized && !nextProps.currentUser.isEmpty()) {
            this._init(nextProps)
        }
    }

    _init(props) {
        const formData = props.currentUser
            .set('signature', fromJS({
                text: props.currentUser.get('signature_text', ''),
                html: props.currentUser.get('signature_html', '')
            }))

        props.initialize(formData.toJS())
        this.isInitialized = true
    }

    _handleSubmit = (values) => {
        const normalizedValues = _cloneDeep(values)

        normalizedValues.signature_text = values.signature.text
        normalizedValues.signature_html = values.signature.html
        delete normalizedValues.signature

        // if no text, set no html
        if (!normalizedValues.signature_text) {
            normalizedValues.signature_html = ''
        }

        return formSender(this.props.actions.submitUser(normalizedValues, 0))
    }

    _savePreferences = (e) => {
        e.preventDefault()

        this.setState({loadingPreferences: true})

        const newSettings = this.props.preferences.update('data', data => data.mergeDeep(this.state.preferences)).toJS()

        return this.props.submitSetting(newSettings, true)
            .then(() => {
                this.setState({loadingPreferences: false})
            })
    }

    render() {
        const {handleSubmit, isLoading} = this.props
        const loadingUser = isLoading && !this.state.loadingPreferences

        return (
            <div>
                <h1>
                    <i className="fa fa-fw fa-user blue mr-2" />
                    Your profile
                </h1>

                <p>
                    Update your profile information.
                </p>

                <Form onSubmit={handleSubmit(this._handleSubmit)}>
                    <Field
                        type="text"
                        name="name"
                        label="Your name"
                        placeholder="John Doe"
                        required
                        component={ReduxFormInputField}
                    />
                    <Field
                        type="email"
                        name="email"
                        label="Your email"
                        placeholder="john.doe@acme.com"
                        required
                        component={ReduxFormInputField}
                    />
                    <Field
                        type="select"
                        name="timezone"
                        label="Timezone"
                        component={ReduxFormInputField}
                    >
                        {
                            moment.tz.names().map((name, idx) => <option key={idx} value={name}>{name}</option>)
                        }
                    </Field>
                    <Field
                        type="select"
                        name="language"
                        label="Language"
                        component={ReduxFormInputField}
                        help="Changing the language also changes the time format"
                    >
                        {
                            AVAILABLE_LANGUAGES.map((locale, idx) => (
                                <option
                                    key={idx}
                                    value={locale.localeName}
                                >
                                    {locale.displayName}
                                </option>
                            ))
                        }
                    </Field>
                    <Field
                        type="text"
                        name="signature"
                        label="Signature"
                        component={ReduxFormInputField}
                        tag={RichField}
                    />

                    <div>
                        <Button
                            type="submit"
                            color="primary"
                            className={classnames({
                                'btn-loading': loadingUser,
                            })}
                            disabled={loadingUser}
                        >
                            Save
                        </Button>
                    </div>
                </Form>

                <form
                    className="ui form mt30"
                    onSubmit={this._savePreferences}
                >
                    <h4 className="ui header">
                        Preferences
                    </h4>

                    <FormGroup>
                        <BooleanField
                            name="show_macros"
                            type="checkbox"
                            label="Display macros by default on emails"
                            value={this.state.preferences.get('show_macros')}
                            onChange={value => this.setState({preferences: this.state.preferences.set('show_macros', value)})}
                        />
                    </FormGroup>

                    <div>
                        <Button
                            type="submit"
                            color="primary"
                            className={classnames({
                                'btn-loading': this.state.loadingPreferences,
                            })}
                            disabled={this.state.loadingPreferences}
                        >
                            Save preferences
                        </Button>
                    </div>
                </form>
            </div>
        )
    }
}

YourProfileView.propTypes = {
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    submitSetting: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
    isLoading: PropTypes.bool
}

export default reduxForm({
    form: 'myProfile',
})(YourProfileView)
