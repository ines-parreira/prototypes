import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'
import moment from 'moment-timezone'

import {AVAILABLE_LANGUAGES} from './../../../../config'
import formSender from '../../../common/utils/formSender'

import {InputField, RichTextAreaField, SelectField} from '../../../common/forms'

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

    componentDidMount() {
        $(this.refs.languageTooltip).popup({
            inline: true,
            position: 'top left',
            offset: -10
        })
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

    _changePreference = (e) => {
        let value = e.target.value
        if (typeof e.target.checked !== 'undefined') {
            value = e.target.checked
        }

        this.setState({
            preferences: this.state.preferences.set(e.target.name, value)
        })
    }

    render() {
        const {handleSubmit, isLoading} = this.props
        const loadingUser = isLoading && !this.state.loadingPreferences

        return (
            <div className="ui grid">
                <div className="six wide column">
                    <h1>
                        <i className="user alternative blue icon ml5ni mr10i" />
                        Your profile
                    </h1>
                    <p>
                        Update your profile information.
                    </p>

                    <form
                        className="ui form"
                        onSubmit={handleSubmit(this._handleSubmit)}
                    >
                        <Field
                            type="text"
                            name="name"
                            label="Name"
                            placeholder="John Doe"
                            required
                            component={InputField}
                        />
                        <Field
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="john.doe@gorgias.io"
                            required
                            component={InputField}
                        />
                        <Field
                            type="datetime"
                            name="timezone"
                            label="Timezone"
                            component={SelectField}
                        >
                            {
                                moment.tz.names().map((name, idx) => <option key={idx} value={name}>{name}</option>)
                            }
                        </Field>
                        <Field
                            type="string"
                            name="language"
                            label="Language"
                            component={SelectField}
                            tooltip={(
                                <span
                                    ref="languageTooltip"
                                    className="inverted tooltip"
                                    data-content="Changing the language also changes the time format."
                                    data-variation="inverted"
                                >
                                    <i className="help circle link icon" />
                                </span>
                            )}
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
                            component={RichTextAreaField}
                        />

                        <div className="field">

                            <button
                                className={classNames('ui', 'green', 'button', {
                                    loading: loadingUser
                                })}
                                disabled={loadingUser}
                            >
                                Save changes
                            </button>

                        </div>
                    </form>

                    <form
                        className="ui form mt30"
                        onSubmit={this._savePreferences}
                    >
                        <h4 className="ui header">
                            Preferences
                        </h4>

                        <div className="ui field">
                            <div className="ui checkbox">
                                <input
                                    id="show_macros"
                                    name="show_macros"
                                    type="checkbox"
                                    checked={this.state.preferences.get('show_macros')}
                                    onChange={this._changePreference}
                                />
                                <label
                                    className="clickable"
                                    htmlFor="show_macros"
                                >
                                    Display macros by default on emails
                                </label>
                            </div>
                        </div>

                        <div className="field">
                            <button
                                className={classNames('ui', 'green', 'button', {
                                    loading: this.state.loadingPreferences
                                })}
                                disabled={this.state.loadingPreferences}
                            >
                                Save preferences
                            </button>
                        </div>
                    </form>
                </div>
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
