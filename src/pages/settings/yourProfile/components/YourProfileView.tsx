import React, {Component, SyntheticEvent, ComponentClass} from 'react'
import classnames from 'classnames'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import _sortBy from 'lodash/sortBy'
import moment from 'moment-timezone'
import {Container, Form, FormGroup, FormText, Label} from 'reactstrap'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {CallForwardingCountries} from 'business/twilio'
import {AVAILABLE_LANGUAGES} from 'config'
import {EditableUserProfile, User, UserSetting} from 'config/types/user'
import Avatar from 'pages/common/components/Avatar/Avatar'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import FileField, {UploadType} from 'pages/common/forms/FileField'
import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/input/InputField'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Tooltip from 'pages/common/components/Tooltip'
import Group from 'pages/common/components/layout/Group'
import settingsCss from 'pages/settings/settings.less'

const defaultContent: Pick<
    State,
    | 'name'
    | 'email'
    | 'password_confirmation'
    | 'bio'
    | 'timezone'
    | 'language'
    | 'meta'
> = {
    name: '',
    email: '',
    password_confirmation: '',
    bio: '',
    timezone: '',
    language: '',
    meta: {profile_picture_url: null},
}

type Props = {
    updateCurrentUser: (object: Partial<EditableUserProfile>) => Promise<User>
    currentUser: Map<any, any>
    submitSetting: (
        object: UserSetting,
        notification: boolean
    ) => Promise<unknown>
    preferences: Map<any, any>
    flags: LDFlagSet
}

type State = {
    bio: string
    email: string
    hasChangedEmail: boolean
    language: string
    isLoading: boolean
    name: string
    preferences: Map<unknown, unknown>
    meta: {
        profile_picture_url: null | string
    }
    password_confirmation?: string
    timezone: string
}

export class YourProfileView extends Component<Props, State> {
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

    _getForm = (props: Props): typeof defaultContent => {
        if (props.currentUser.isEmpty()) {
            return defaultContent
        }

        return _pick(
            props.currentUser.toJS(),
            Object.keys(defaultContent)
        ) as typeof defaultContent
    }

    _handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault()
        const normalizedValues = _pick(
            this.state,
            // metadata is not editable from this component
            // so there is no point to send potential outdated data.
            Object.keys(_omit(defaultContent, 'meta'))
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
                password_confirmation: '',
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
            meta: this.state.meta,
        })
    }

    render() {
        const {isLoading, hasChangedEmail, password_confirmation} = this.state

        const {flags} = this.props
        const isPrefillBestMacroEnabled: boolean | undefined =
            flags[FeatureFlagKey.PrefillBestMacro]

        return (
            <div className="full-width">
                <PageHeader title="Your profile" />
                <Container fluid className={settingsCss.pageContainer}>
                    <div
                        className={classnames(
                            'heading-subsection-semibold',
                            settingsCss.mb16
                        )}
                    >
                        Personal information
                    </div>
                    <Form onSubmit={this._handleSubmit}>
                        <div className="flex flex-wrap">
                            <div className={settingsCss.leftSideWrapper}>
                                <InputField
                                    name="name"
                                    label="Your name"
                                    placeholder="John Doe"
                                    isRequired
                                    value={this.state.name}
                                    onChange={(name) => this.setState({name})}
                                    className={settingsCss.inputField}
                                />
                                <InputField
                                    type="email"
                                    name="email"
                                    label="Your email"
                                    placeholder="john.doe@acme.com"
                                    isRequired
                                    value={this.state.email}
                                    onChange={this._onEmailChange}
                                    className={settingsCss.inputField}
                                />
                                {hasChangedEmail ? (
                                    <InputField
                                        type="password"
                                        name="password_confirmation"
                                        label="Password confirmation"
                                        placeholder="Your password"
                                        isRequired
                                        value={password_confirmation}
                                        onChange={(password_confirmation) =>
                                            this.setState({
                                                password_confirmation,
                                            })
                                        }
                                        className={settingsCss.inputField}
                                    />
                                ) : null}
                                <InputField
                                    type="text"
                                    name="bio"
                                    label="Your bio"
                                    caption={
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
                                    className={settingsCss.inputField}
                                />
                                <FormGroup className={settingsCss.inputField}>
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
                                <FormGroup className={settingsCss.inputField}>
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
                                    settingsCss.profilePicture,
                                    settingsCss.inputField
                                )}
                            >
                                <Label className="control-label">
                                    Profile picture
                                </Label>

                                <Avatar
                                    name={this.state.name}
                                    size={100}
                                    url={this.state.meta.profile_picture_url}
                                    className={settingsCss.mb16}
                                />

                                <FileField
                                    returnFiles={false}
                                    noPreview={true}
                                    onChange={(picture_url: string) =>
                                        this.setState(
                                            {
                                                meta: _merge(this.state.meta, {
                                                    profile_picture_url:
                                                        picture_url,
                                                }),
                                            },
                                            () => {
                                                void this._saveProfilePicture()
                                            }
                                        )
                                    }
                                    uploadType={UploadType.Profile}
                                    maxSize={500 * 1000}
                                    className={settingsCss.mb16}
                                />

                                <FormText color="muted">
                                    The picture must be square and weight less
                                    than 500kB.
                                </FormText>

                                {this.state.meta.profile_picture_url && (
                                    <a
                                        href="#"
                                        className="text-danger"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            this.setState(
                                                {
                                                    meta: _merge(
                                                        this.state.meta,
                                                        {
                                                            profile_picture_url:
                                                                null,
                                                        }
                                                    ),
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
                        <div className={settingsCss.contentWrapper}>
                            <div
                                className={classnames(
                                    'heading-subsection-semibold',
                                    settingsCss.mb16
                                )}
                            >
                                Account Preferences
                            </div>

                            <FormGroup
                                className={classnames(
                                    settingsCss.inputField,
                                    settingsCss.mb32,
                                    'body-regular'
                                )}
                            >
                                {isPrefillBestMacroEnabled && (
                                    <Group className={'align-items-baseline'}>
                                        <CheckBox
                                            className="mb-2 pr-1"
                                            name="prefill_best_macro"
                                            isChecked={
                                                this.state.preferences.get(
                                                    'prefill_best_macro'
                                                ) as boolean
                                            }
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    preferences:
                                                        this.state.preferences.set(
                                                            'prefill_best_macro',
                                                            value
                                                        ),
                                                })
                                            }
                                        >
                                            Auto-fill macros with high success
                                            rate
                                        </CheckBox>
                                        <i
                                            id="autofill-tooltip"
                                            className="material-icons md-1 mr-1"
                                        >
                                            info
                                        </i>
                                        <Tooltip
                                            target="autofill-tooltip"
                                            placement="top-start"
                                        >
                                            Whenever a macro responds to a
                                            question accurately, it’s going to
                                            be pre-filled.
                                        </Tooltip>
                                    </Group>
                                )}
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
                                className={classnames(
                                    settingsCss.inputField,
                                    settingsCss.mb40
                                )}
                            >
                                <div
                                    className={classnames(
                                        'heading-subsection-semibold',
                                        settingsCss.mb16
                                    )}
                                >
                                    Forward calls to an external number
                                </div>
                                <p className="body-regular">
                                    When you are routed a call in Gorgias,
                                    forward the call to a mobile device or
                                    landline.
                                </p>

                                <ToggleInput
                                    className={settingsCss.inputField}
                                    name="forward_calls"
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
                                >
                                    Enable call forwarding
                                </ToggleInput>
                                {this.state.preferences.get(
                                    'forward_calls'
                                ) && (
                                    <div style={{marginLeft: '50px'}}>
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
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </FormGroup>
                        </div>

                        <Button type="submit" isLoading={isLoading}>
                            Save Changes
                        </Button>
                    </Form>
                </Container>
            </div>
        )
    }
}

export default withLDConsumer()(
    YourProfileView as any as ComponentClass<Omit<Props, 'flags'>>
)
