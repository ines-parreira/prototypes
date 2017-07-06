import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import moment from 'moment-timezone'
import {Form, FormGroup, Button} from 'reactstrap'

import {AVAILABLE_LANGUAGES} from './../../../../config'

import BooleanField from '../../../common/forms/BooleanField'
import RichField from '../../../common/forms/RichField'
import InputField from '../../../common/forms/InputField'

const defaultContent = {
    name: '',
    email: '',
    timezone: '',
    language: '',
}

class YourProfileView extends React.Component {
    constructor(props) {
        super(props)

        this.isInitialized = false

        this.state = _merge({
            loadingPreferences: false,
            preferences: props.preferences.get('data'),
            signature: {
                text: '',
                html: '',
            },
        }, this._getForm(props))
    }

    componentWillUpdate(nextProps) {
        if (!this.isInitialized && !nextProps.currentUser.isEmpty()) {
            this.setState(this._getForm(nextProps))
            this.isInitialized = true
        }
    }

    _getForm(props) {
        if (props.currentUser.isEmpty()) {
            return defaultContent
        }

        return _merge(
            _pick(props.currentUser.toJS(), Object.keys(defaultContent)),
            {
                signature: {
                    text: props.currentUser.get('signature_text', ''),
                    html: props.currentUser.get('signature_html', '')
                }
            }
        )
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const normalizedValues = _merge(
            _pick(this.state, Object.keys(defaultContent)),
            {
                signature_text: this.state.signature.text,
                signature_html: this.state.signature.html
            }
        )

        // if no text, set no html
        if (!normalizedValues.signature_text) {
            normalizedValues.signature_html = ''
        }

        return this.props.actions.submitUser(normalizedValues, 0)
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
        const {isLoading} = this.props
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

                <Form
                    className="mb-4"
                    onSubmit={this._handleSubmit}
                >
                    <InputField
                        type="text"
                        name="name"
                        label="Your name"
                        placeholder="John Doe"
                        required
                        value={this.state.name}
                        onChange={name => this.setState({name})}
                    />
                    <InputField
                        type="email"
                        name="email"
                        label="Your email"
                        placeholder="john.doe@acme.com"
                        required
                        value={this.state.email}
                        onChange={email => this.setState({email})}
                    />
                    <InputField
                        type="select"
                        name="timezone"
                        label="Timezone"
                        value={this.state.timezone}
                        onChange={timezone => this.setState({timezone})}
                    >
                        {
                            moment.tz.names().map((name, idx) => <option key={idx} value={name}>{name}</option>)
                        }
                    </InputField>
                    <InputField
                        type="select"
                        name="language"
                        label="Language"
                        help="Changing the language also changes the time format"
                        value={this.state.language}
                        onChange={language => this.setState({language})}
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
                    </InputField>
                    <RichField
                        name="signature"
                        label="Signature"
                        value={this.state.signature}
                        onChange={signature => this.setState({signature})}
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

                <h4>
                    Preferences
                </h4>

                <form onSubmit={this._savePreferences}>
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
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    submitSetting: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
    isLoading: PropTypes.bool
}

export default YourProfileView
