import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import moment from 'moment-timezone'
import {
    Container, Form, FormGroup, FormText, Button, Label, Row, Col
} from 'reactstrap'

import {AVAILABLE_LANGUAGES} from './../../../../config'

import BooleanField from '../../../common/forms/BooleanField'
import InputField from '../../../common/forms/InputField'
import Avatar from '../../../common/components/Avatar'
import FileField from '../../../common/forms/FileField'
import PageHeader from '../../../common/components/PageHeader'
import {Link} from 'react-router'

const defaultContent = {
    name: '',
    email: '',
    bio: '',
    timezone: '',
    language: ''
}

class YourProfileView extends React.Component {
    constructor(props) {
        super(props)

        this.isInitialized = false

        this.state = _merge({
            loadingPreferences: false,
            preferences: props.preferences.get('data'),
        }, this._getForm(props))

        if (!this.props.currentUser.isEmpty()) {
            this.isInitialized = true
        }
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
                profilePictureUrl: props.currentUser.getIn(['meta', 'profile_picture_url'])
            }
        )
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const normalizedValues = _merge(
            _pick(this.state, Object.keys(defaultContent)),
            {
                meta: {
                    profile_picture_url: this.state.profilePictureUrl
                }
            }
        )

        return this.props.updateCurrentUser(normalizedValues)
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
            <div className="full-width">
                <PageHeader title="Your profile"/>
                <Container
                    fluid
                    className="page-container"
                >
                    <p>Update your profile information.</p>
                    <Form
                        className="mb-4"
                        onSubmit={this._handleSubmit}
                    >
                        <Row>
                            <Col md="9">
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
                                    type="text"
                                    name="bio"
                                    label="Your bio"
                                    help={
                                        <span>
                                            Your bio can be used in signatures as a variable. Admins can set up
                                            signatures{' '}
                                            <Link to="/app/settings/integrations/email">
                                                in each email integration
                                            </Link>
                                        </span>
                                    }
                                    value={this.state.bio}
                                    onChange={bio => this.setState({bio})}
                                />
                                <InputField
                                    type="select"
                                    name="timezone"
                                    label="Timezone"
                                    value={this.state.timezone}
                                    onChange={timezone => this.setState({timezone})}
                                >
                                    {
                                        moment.tz.names().map((name, idx) => (
                                            <option
                                                key={idx}
                                                value={name}
                                            >
                                                {name}
                                            </option>
                                        ))
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
                            </Col>
                            <Col
                                md="3"
                                xs="12"
                            >
                                <FormGroup>
                                    <Label className="control-label">
                                        Profile picture
                                    </Label>

                                    <div>
                                        <Avatar
                                            email={this.state.email}
                                            name={this.state.name}
                                            size="100"
                                            url={this.state.profilePictureUrl}
                                        />
                                    </div>

                                    <br/>

                                    <FileField
                                        returnFiles={false}
                                        noPreview={true}
                                        onChange={(data) => this.setState({profilePictureUrl: data})}
                                        uploadType="profile_picture"
                                    />

                                    <FormText color="muted">
                                        The image must be square and weight less than 500kB.<br/>
                                        If you don't want to upload your picture here, but have a <a
                                            href="https://en.gravatar.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >Gravatar</a>{' '}
                                        account, we'll use it.
                                    </FormText>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Button
                            type="submit"
                            color="success"
                            className={classnames({
                                'btn-loading': loadingUser,
                            })}
                            disabled={loadingUser}
                        >
                            Save your profile
                        </Button>
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
                                color="success"
                                className={classnames({
                                    'btn-loading': this.state.loadingPreferences,
                                })}
                                disabled={this.state.loadingPreferences}
                            >
                                Save preferences
                            </Button>
                        </div>
                    </form>
                </Container>
            </div>
        )
    }
}

YourProfileView.propTypes = {
    updateCurrentUser: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    submitSetting: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
    isLoading: PropTypes.bool
}

export default YourProfileView
