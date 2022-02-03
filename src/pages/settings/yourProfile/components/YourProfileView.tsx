import React, {Component, SyntheticEvent} from 'react'
import classnames from 'classnames'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import _sortBy from 'lodash/sortBy'
import moment from 'moment-timezone'
import {Button, Container, Form, FormGroup, FormText, Label} from 'reactstrap'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/InputField'
import Avatar from '../../../common/components/Avatar/Avatar'
import FileField from '../../../common/forms/FileField'
import SelectField from '../../../common/forms/SelectField/SelectField'
import ToggleField from '../../../common/forms/ToggleField'
import PhoneNumberInput from '../../../common/forms/PhoneNumberInput/PhoneNumberInput'
import PageHeader from '../../../common/components/PageHeader'
import {AVAILABLE_LANGUAGES} from '../../../../config'
import {CallForwardingCountries} from '../../../../business/twilio'
import {
    EditableUserProfile,
    User,
    UserSetting,
} from '../../../../config/types/user'

import css from '../../settings.less'

const defaultContent: Pick<
    State,
    'name' | 'email' | 'password_confirmation' | 'bio' | 'timezone' | 'language'
> = {
    name: '',
    email: '',
    password_confirmation: null,
    bio: '',
    timezone: '',
    language: '',
}

type Props = {
    updateCurrentUser: (object: Partial<EditableUserProfile>) => Promise<User>
    currentUser: Map<any, any>
    submitSetting: (
        object: UserSetting,
        notification: boolean
    ) => Promise<unknown>
    preferences: Map<any, any>
}

type State = {
    bio: string
    email: string
    hasChangedEmail: boolean
    language: string
    isLoading: boolean
    name: string
    preferences: Map<unknown, unknown>
    profilePictureUrl?: string
    password_confirmation: null | string
    timezone: string
}

export default class YourProfileView extends Component<Props, State> {
    isInitialized: boolean

    constructor(props: Props) {
        super(props)

        this.isInitialized = false

        this.state = _merge(
            {
                isLoading: false,
                preferences: props.preferences.get('data'),
                hasChangedEmail: false,
            },
            this._getForm(props)
        )

        if (!this.props.currentUser.isEmpty()) {
            this.isInitialized = true
        }
    }

    componentWillUpdate(nextProps: Props) {
        if (!this.isInitialized && !nextProps.currentUser.isEmpty()) {
            this.setState(this._getForm(nextProps))
            this.isInitialized = true
        }
    }

    _getForm = (
        props: Props
    ): typeof defaultContent & {profilePictureUrl?: string} => {
        if (props.currentUser.isEmpty()) {
            return defaultContent
        }

        return _merge(
            _pick(
                props.currentUser.toJS(),
                Object.keys(defaultContent)
            ) as typeof defaultContent,
            {
                profilePictureUrl: props.currentUser.getIn([
                    'meta',
                    'profile_picture_url',
                ]),
            }
        )
    }

    _handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault()
        const normalizedValues = _pick(
            this.state,
            Object.keys(defaultContent)
        ) as EditableUserProfile

        this.setState({isLoading: true})

        const newSettings = this.props.preferences
            .update('data', (data: Map<any, any>) =>
                data.mergeDeep(this.state.preferences)
            )
            .toJS()

        const [user] = await Promise.all([
            this.props.updateCurrentUser(normalizedValues),
            this.props.submitSetting(newSettings, false),
        ])

        this.setState({isLoading: false})

        if (user.email === normalizedValues.email) {
            this.setState({
                hasChangedEmail: false,
                password_confirmation: null,
            })
        }
    }

    _onEmailChange = (email: string) => {
        this.setState({
            email,
            hasChangedEmail: this.props.currentUser.get('email') !== email,
        })
    }

    _saveProfilePicture = () => {
        return this.props.updateCurrentUser({
            meta: {
                profile_picture_url: this.state.profilePictureUrl,
            },
        })
    }

    render() {
        const {isLoading, hasChangedEmail, password_confirmation} = this.state

        return (
            <div className="full-width">
                <PageHeader title="Your profile" />
                <Container fluid className={css.pageContainer}>
                    <div
                        className={classnames(
                            css['heading-subsection-semibold'],
                            css.mb16
                        )}
                    >
                        Personal information
                    </div>
                    <Form onSubmit={this._handleSubmit}>
                        <div className="flex flex-wrap">
                            <div className={css.leftSideWrapper}>
                                <InputField
                                    type="text"
                                    name="name"
                                    label="Your name"
                                    placeholder="John Doe"
                                    required
                                    value={this.state.name}
                                    onChange={(name) => this.setState({name})}
                                    className={css.inputField}
                                />
                                <InputField
                                    type="email"
                                    name="email"
                                    label="Your email"
                                    placeholder="john.doe@acme.com"
                                    required
                                    value={this.state.email}
                                    onChange={this._onEmailChange}
                                    className={css.inputField}
                                />
                                {hasChangedEmail ? (
                                    <InputField
                                        type="password"
                                        name="password_confirmation"
                                        label="Password confirmation"
                                        placeholder="Your password"
                                        required
                                        value={password_confirmation}
                                        onChange={(password_confirmation) =>
                                            this.setState({
                                                password_confirmation,
                                            })
                                        }
                                        className={css.inputField}
                                    />
                                ) : null}
                                <InputField
                                    type="text"
                                    name="bio"
                                    label="Your bio"
                                    help={
                                        <span>
                                            Your bio can be used in signatures
                                            as a variable. Admins can set up
                                            signatures{' '}
                                            <Link to="/app/settings/integrations/email">
                                                in each email integration
                                            </Link>
                                        </span>
                                    }
                                    value={this.state.bio}
                                    onChange={(bio) => this.setState({bio})}
                                    className={css.inputField}
                                />
                                <FormGroup className={css.inputField}>
                                    <Label className="control-label">
                                        Timezone
                                    </Label>
                                    <SelectField
                                        value={this.state.timezone}
                                        options={_sortBy(
                                            moment.tz
                                                .names()
                                                .filter(
                                                    (name) =>
                                                        name !==
                                                        'US/Pacific-New'
                                                )
                                                /*
                                            US/Pacific-New is not supposed to be a valid timezone and as such, pytz
                                            (the validator on backend) doesn't allow it, so we skip it.
                                            More info at: https://github.com/moment/moment-timezone/issues/498
                                            */
                                                .map((name) => ({
                                                    value: name,
                                                    label: `(UTC${moment
                                                        .tz(name)
                                                        .format('Z')}) ${name}`,
                                                })),
                                            (item) =>
                                                moment
                                                    .tz(item.value)
                                                    .utcOffset()
                                        )}
                                        onChange={(value) =>
                                            this.setState({
                                                timezone: value.toString(),
                                            })
                                        }
                                        fullWidth
                                    />
                                </FormGroup>
                                <FormGroup className={css.inputField}>
                                    <Label className="control-label">
                                        Language
                                    </Label>
                                    <SelectField
                                        value={this.state.language}
                                        onChange={(value) =>
                                            this.setState({
                                                language: value.toString(),
                                            })
                                        }
                                        options={AVAILABLE_LANGUAGES.map(
                                            (locale) => ({
                                                value: locale.localeName,
                                                label: locale.displayName,
                                            })
                                        )}
                                        fullWidth
                                    />
                                    <FormText color="muted">
                                        Changing the language only changes the
                                        time format
                                    </FormText>
                                </FormGroup>
                            </div>
                            <FormGroup
                                className={classnames(
                                    css.profilePicture,
                                    css.inputField
                                )}
                            >
                                <Label className="control-label">
                                    Profile picture
                                </Label>

                                <Avatar
                                    name={this.state.name}
                                    size={100}
                                    url={this.state.profilePictureUrl}
                                    className={css.mb16}
                                />

                                <FileField
                                    key={this.state.profilePictureUrl}
                                    returnFiles={false}
                                    noPreview={true}
                                    onChange={(picture_url: string) =>
                                        this.setState(
                                            {
                                                profilePictureUrl: picture_url,
                                            },
                                            () => {
                                                void this._saveProfilePicture()
                                            }
                                        )
                                    }
                                    uploadType="profile_picture"
                                    maxSize={500 * 1000}
                                    className={css.mb16}
                                />

                                <FormText color="muted">
                                    The picture must be square and weight less
                                    than 500kB.
                                </FormText>

                                {this.state.profilePictureUrl && (
                                    <a
                                        href="#"
                                        className="text-danger"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            this.setState(
                                                {
                                                    profilePictureUrl:
                                                        undefined,
                                                },
                                                () => {
                                                    void this._saveProfilePicture()
                                                }
                                            )
                                        }}
                                    >
                                        Remove Picture
                                    </a>
                                )}
                            </FormGroup>
                        </div>
                        <div className={css.contentWrapper}>
                            <div
                                className={classnames(
                                    css['heading-subsection-semibold'],
                                    css.mb16
                                )}
                            >
                                Account Preferences
                            </div>

                            <FormGroup
                                className={classnames(
                                    css.inputField,
                                    css.mb32,
                                    css['body-regular']
                                )}
                            >
                                <CheckBox
                                    className="mb-2"
                                    name="show_macros"
                                    isChecked={
                                        this.state.preferences.get(
                                            'show_macros'
                                        ) as boolean
                                    }
                                    onChange={(value: boolean) =>
                                        this.setState({
                                            preferences:
                                                this.state.preferences.set(
                                                    'show_macros',
                                                    value
                                                ),
                                        })
                                    }
                                >
                                    Display macros by default on emails
                                </CheckBox>
                                <CheckBox
                                    name="show_macros_suggestions"
                                    isChecked={
                                        this.state.preferences.get(
                                            'show_macros_suggestions',
                                            true
                                        ) as boolean
                                    }
                                    onChange={(value: boolean) =>
                                        this.setState({
                                            preferences:
                                                this.state.preferences.set(
                                                    'show_macros_suggestions',
                                                    value
                                                ),
                                        })
                                    }
                                >
                                    Display macros suggestions in message editor
                                </CheckBox>
                            </FormGroup>
                            <FormGroup
                                className={classnames(css.inputField, css.mb40)}
                            >
                                <div
                                    className={classnames(
                                        css['heading-subsection-semibold'],
                                        css.mb16
                                    )}
                                >
                                    Forward calls to an external number
                                </div>
                                <p className={css['body-regular']}>
                                    When you are routed a call in Gorgias,
                                    forward the call to a mobile device or
                                    landline.
                                </p>

                                <ToggleField
                                    name="forward_calls"
                                    label="Enable call forwarding"
                                    isToggled={
                                        (this.state.preferences.get(
                                            'forward_calls'
                                        ) as boolean) ?? false
                                    }
                                    onClick={(value: boolean) => {
                                        this.setState({
                                            preferences:
                                                this.state.preferences.set(
                                                    'forward_calls',
                                                    value
                                                ),
                                        })
                                    }}
                                />
                                {this.state.preferences.get(
                                    'forward_calls'
                                ) && (
                                    <div style={{marginLeft: '47px'}}>
                                        <PhoneNumberInput
                                            value={
                                                (this.state.preferences.get(
                                                    'forwarding_phone_number'
                                                ) as string) ?? ''
                                            }
                                            onChange={(value: string) => {
                                                this.setState({
                                                    preferences:
                                                        this.state.preferences.set(
                                                            'forwarding_phone_number',
                                                            value === ''
                                                                ? null
                                                                : value
                                                        ),
                                                })
                                            }}
                                            allowedCountries={Object.values(
                                                CallForwardingCountries
                                            )}
                                        />
                                    </div>
                                )}
                            </FormGroup>
                        </div>

                        <Button
                            type="submit"
                            color="success"
                            className={classnames({
                                'btn-loading': isLoading,
                            })}
                            disabled={isLoading}
                        >
                            Save Changes
                        </Button>
                    </Form>
                </Container>
            </div>
        )
    }
}
