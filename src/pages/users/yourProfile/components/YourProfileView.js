import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {Link} from 'react-router'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _ from 'lodash'
import moment from 'moment-timezone'

import {AVAILABLE_LANGUAGES} from './../../../../config'
import formSender from '../../../common/utils/formSender'

import {InputField, RichTextAreaField, SelectField} from '../../../common/components/formFields'


class YourProfileView extends React.Component {
    constructor(props) {
        super(props)

        this.isInitialized = false

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
        props.initialize(props.currentUser.set('signature', fromJS({
            text: props.currentUser.get('signature_text', ''),
            html: props.currentUser.get('signature_html', '')
        })).toJS())
        this.isInitialized = true
    }

    _handleSubmit = (values) => {
        const normalizedValues = _.cloneDeep(values)

        normalizedValues.signature_text = values.signature.text
        normalizedValues.signature_html = values.signature.html
        delete normalizedValues.signature

        return formSender(this.props.actions.submitUser(normalizedValues, 0))
    }

    render() {
        const {handleSubmit, isLoading} = this.props

        return (
            <div className="ui grid">
                <div className="twelve wide column">
                    <h1>Your profile</h1>
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
                            <label>Password</label>
                            <Link
                                type="button"
                                className="ui basic grey button"
                                to="/app/your-profile/change-password"
                            >
                                Change password
                            </Link>
                        </div>

                        <br /><br />

                        <div className="field">

                            <button
                                className={classNames('ui', 'green', 'button', {loading: isLoading})}
                                disabled={isLoading}
                            >
                                Save changes
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
    isLoading: PropTypes.bool
}

export default reduxForm({
    form: 'myProfile',
})(YourProfileView)
