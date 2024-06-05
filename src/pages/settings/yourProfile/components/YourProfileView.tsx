import React, {Component, SyntheticEvent} from 'react'
import classnames from 'classnames'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import _sortBy from 'lodash/sortBy'
import moment from 'moment-timezone'
import {Container, Form, FormGroup, FormText, Label} from 'reactstrap'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import _isEqual from 'lodash/isEqual'
import {UploadType} from 'common/types'
import {EditableUserProfile, User, UserSetting} from 'config/types/user'
import Avatar from 'pages/common/components/Avatar/Avatar'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import FileField from 'pages/common/forms/FileField'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Group from 'pages/common/components/layout/Group'
import settingsCss from 'pages/settings/settings.less'
import {logEvent, SegmentEvent} from 'common/segment'
import {Theme, ThemeProps, useSavedTheme, withTheme} from 'theme'
import ThemeList from 'pages/settings/yourProfile/components/ThemeList'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import DateAndTimeFormatting from 'pages/settings/yourProfile/components/DateAndTimeFormatting'
import ForwardingCallsPreferences from './ForwardingCallsPreferences'

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
} & ThemeProps

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
    initialTheme: ReturnType<typeof useSavedTheme>
    isDirty: boolean

    constructor(props: Props) {
        super(props)

        this.isInitialized = false
        this.initialTheme = props.savedTheme
        this.isDirty = false

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

    _handleSubmit = async (event?: SyntheticEvent) => {
        if (event) {
            event.preventDefault()
        }
        this.isDirty = false

        if (this.initialTheme !== this.props.savedTheme) {
            logEvent(SegmentEvent.ThemeUpdate, {
                theme: this.props.savedTheme,
            })
        }

        this.initialTheme = this.props.savedTheme

        const normalizedValues = _pick(
            this.state,
            // metadata is not editable from this component
            // so there is no point to send potential outdated data.
            Object.keys(_omit(defaultContent, ['meta', 'language']))
        ) as EditableUserProfile

        this.setState({isLoading: true})

        const newSettings = this.props.preferences
            .update('data', (data: Map<any, any>) =>
                data.mergeDeep(this.state.preferences)
            )
            .toJS()

        if (
            !_isEqual(
                (this.props.preferences.get('data') as Map<string, any>).toJS(),
                this.state.preferences.toJS()
            )
        ) {
            logEvent(SegmentEvent.UserSettingsUpdated, {
                newSettings: this.state.preferences.toJS(),
                oldSettings: (
                    this.props.preferences.get('data') as Map<string, any>
                ).toJS(),
            })
        }

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

    onChangeTheme = (theme: Theme) => {
        this.isDirty = true
        this.props.setTheme(theme)
    }

    render() {
        const {isLoading, hasChangedEmail, password_confirmation} = this.state

        return (
            <div className="full-width">
                <UnsavedChangesPrompt
                    onSave={() => this._handleSubmit()}
                    onDiscard={() => {
                        this.isDirty = false
                        this.props.setTheme(this.initialTheme)
                    }}
                    when={this.isDirty}
                />
                <PageHeader title="Your profile" />
                <Container fluid className={settingsCss.pageContainer}>
                    <div className={settingsCss.headingSection}>
                        Personal information
                    </div>
                    <Form onSubmit={this._handleSubmit}>
                        <div className="flex flex-wrap">
                            <div className={settingsCss.leftSideWrapper}>
                                <div className={settingsCss.section}>
                                    <InputField
                                        name="name"
                                        label="Your name"
                                        placeholder="John Doe"
                                        isRequired
                                        value={this.state.name}
                                        onChange={(name) => {
                                            this.isDirty = true
                                            this.setState({name})
                                        }}
                                        className={settingsCss.inputField}
                                    />
                                    <InputField
                                        type="email"
                                        name="email"
                                        label="Your email"
                                        placeholder="john.doe@acme.com"
                                        isRequired
                                        value={this.state.email}
                                        onChange={(email) => {
                                            this.isDirty = true
                                            this._onEmailChange(email)
                                        }}
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
                                            onChange={(
                                                password_confirmation
                                            ) => {
                                                this.isDirty = true
                                                this.setState({
                                                    password_confirmation,
                                                })
                                            }}
                                            className={settingsCss.inputField}
                                        />
                                    ) : null}
                                    <InputField
                                        type="text"
                                        name="bio"
                                        label="Your bio"
                                        caption={
                                            <span>
                                                Your bio can be used in
                                                signatures as a variable. Admins
                                                can set up signatures{' '}
                                                <Link to="/app/settings/channels/email">
                                                    in each email integration
                                                </Link>
                                            </span>
                                        }
                                        value={this.state.bio}
                                        onChange={(bio) => {
                                            this.isDirty = true
                                            this.setState({bio})
                                        }}
                                        className={settingsCss.inputField}
                                    />
                                </div>
                                <div className={settingsCss.headingSection}>
                                    Date and time settings
                                </div>
                                <div className={settingsCss.section}>
                                    <FormGroup
                                        className={settingsCss.inputField}
                                    >
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
                                                            .format(
                                                                'Z'
                                                            )}) ${name}`,
                                                    })),
                                                (item) =>
                                                    moment
                                                        .tz(item.value)
                                                        .utcOffset()
                                            )}
                                            onChange={(value) => {
                                                this.isDirty = true
                                                this.setState({
                                                    timezone: value.toString(),
                                                })
                                            }}
                                            fullWidth
                                        />
                                    </FormGroup>
                                    <DateAndTimeFormatting
                                        dateFormat={
                                            this.state.preferences.get(
                                                'date_format'
                                            ) as string
                                        }
                                        timeFormat={
                                            this.state.preferences.get(
                                                'time_format'
                                            ) as string
                                        }
                                        onSelectDateFormat={(value: string) => {
                                            this.isDirty = true
                                            this.setState({
                                                preferences:
                                                    this.state.preferences.set(
                                                        'date_format',
                                                        value
                                                    ),
                                            })
                                        }}
                                        onSelectTimeFormat={(value: string) => {
                                            this.isDirty = true
                                            this.setState({
                                                preferences:
                                                    this.state.preferences.set(
                                                        'time_format',
                                                        value
                                                    ),
                                            })
                                        }}
                                    />
                                </div>
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
                                    The picture must be square and weigh less
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
                            <div className={settingsCss.headingSection}>
                                Account preferences
                            </div>
                            <div className={settingsCss.section}>
                                <div className={settingsCss.headingSubsection}>
                                    Theme
                                </div>
                                <div className={settingsCss.section}>
                                    <ThemeList
                                        savedTheme={this.props.savedTheme}
                                        onChangeTheme={this.onChangeTheme}
                                    />
                                </div>
                                <div className={settingsCss.headingSubsection}>
                                    Macro display
                                </div>
                                <div className={settingsCss.subsection}>
                                    <FormGroup
                                        className={classnames(
                                            settingsCss.inputField,
                                            'body-regular'
                                        )}
                                    >
                                        <Group
                                            orientation="vertical"
                                            className={settingsCss.inputField}
                                        >
                                            <ToggleInput
                                                name="prefill_best_macro"
                                                isToggled={
                                                    this.state.preferences.get(
                                                        'prefill_best_macro'
                                                    ) as boolean
                                                }
                                                onClick={(value: boolean) => {
                                                    this.isDirty = true
                                                    this.setState({
                                                        preferences:
                                                            this.state.preferences.set(
                                                                'prefill_best_macro',
                                                                value
                                                            ),
                                                    })
                                                }}
                                            >
                                                <i
                                                    className={classnames(
                                                        'material-icons',
                                                        settingsCss.AIIcon
                                                    )}
                                                >
                                                    auto_awesome
                                                </i>
                                                AI Macro prediction
                                            </ToggleInput>
                                            <FormText
                                                color="muted"
                                                className={
                                                    settingsCss.macroDescription
                                                }
                                            >
                                                Automatically select macros
                                                based on ticket content.{' '}
                                                <a
                                                    href="https://docs.gorgias.com/en-US/macros-81846#:~:text=will%20be%20easier.-,Additional%20features,-Still%20not%20fast"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Learn more
                                                </a>
                                            </FormText>
                                        </Group>
                                        <Group
                                            orientation="vertical"
                                            className={settingsCss.inputField}
                                        >
                                            <ToggleInput
                                                name="show_macros_suggestions"
                                                isToggled={
                                                    this.state.preferences.get(
                                                        'show_macros_suggestions',
                                                        true
                                                    ) as boolean
                                                }
                                                onClick={(value: boolean) => {
                                                    this.isDirty = true
                                                    this.setState({
                                                        preferences:
                                                            this.state.preferences.set(
                                                                'show_macros_suggestions',
                                                                value
                                                            ),
                                                    })
                                                }}
                                            >
                                                <i
                                                    className={classnames(
                                                        'material-icons',
                                                        settingsCss.AIIcon
                                                    )}
                                                >
                                                    auto_awesome
                                                </i>
                                                AI Macro suggestions
                                            </ToggleInput>
                                            <FormText
                                                color="muted"
                                                className={
                                                    settingsCss.macroDescription
                                                }
                                            >
                                                Display suggested macros that
                                                can be applied to tickets with
                                                one click.{' '}
                                                <a
                                                    href="https://docs.gorgias.com/en-US/macros-81846#:~:text=will%20be%20easier.-,Additional%20features,-Still%20not%20fast"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Learn more
                                                </a>
                                            </FormText>
                                        </Group>
                                        <Group
                                            orientation="vertical"
                                            className={settingsCss.inputField}
                                        >
                                            <ToggleInput
                                                name="show_macros"
                                                isToggled={
                                                    this.state.preferences.get(
                                                        'show_macros'
                                                    ) as boolean
                                                }
                                                onClick={(value: boolean) => {
                                                    this.isDirty = true
                                                    this.setState({
                                                        preferences:
                                                            this.state.preferences.set(
                                                                'show_macros',
                                                                value
                                                            ),
                                                    })
                                                }}
                                            >
                                                Display macro search view by
                                                default
                                            </ToggleInput>
                                            <FormText
                                                color="muted"
                                                className={
                                                    settingsCss.macroDescription
                                                }
                                            >
                                                Always display the macro search
                                                view when responding to incoming
                                                emails.{' '}
                                                <a
                                                    href="https://docs.gorgias.com/en-US/macros-81846#:~:text=will%20be%20easier.-,Additional%20features,-Still%20not%20fast"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Learn more
                                                </a>
                                            </FormText>
                                        </Group>
                                    </FormGroup>
                                </div>
                                <ForwardingCallsPreferences
                                    forwardCalls={
                                        this.state.preferences.get(
                                            'forward_calls',
                                            false
                                        ) as boolean
                                    }
                                    forwardingPhoneNumber={
                                        this.state.preferences.get(
                                            'forwarding_phone_number',
                                            ''
                                        ) as string
                                    }
                                    forwardWhenOffline={
                                        this.state.preferences.get(
                                            'forward_when_offline',
                                            false
                                        ) as boolean
                                    }
                                    setPreference={(preferenceKey, value) => {
                                        this.isDirty = true
                                        this.setState({
                                            preferences:
                                                this.state.preferences.set(
                                                    preferenceKey,
                                                    value
                                                ),
                                        })
                                    }}
                                />
                            </div>
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

export default withTheme(YourProfileView)
