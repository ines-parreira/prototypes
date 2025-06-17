import { SyntheticEvent, useCallback, useMemo, useState } from 'react'

import classnames from 'classnames'
import { Map } from 'immutable'
import _isEqual from 'lodash/isEqual'
import _merge from 'lodash/merge'
import _omit from 'lodash/omit'
import _pick from 'lodash/pick'
import _sortBy from 'lodash/sortBy'
import moment from 'moment-timezone'
import { Link } from 'react-router-dom'
import { Form, FormGroup, FormText, Label } from 'reactstrap'

import {
    Avatar,
    Button,
    SelectField,
    ToggleField,
} from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { UploadType } from 'common/types'
import {
    EditableUserProfile,
    UserSetting,
    UserSettingType,
} from 'config/types/user'
import { useSetTheme, useTheme } from 'core/theme'
import type { HelpdeskThemeName } from 'core/theme'
import useAppDispatch from 'hooks/useAppDispatch'
import Group from 'pages/common/components/layout/Group'
import PageHeader from 'pages/common/components/PageHeader'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import FileField from 'pages/common/forms/FileField'
import InputField from 'pages/common/forms/input/InputField'
import settingsCss from 'pages/settings/settings.less'
import DateAndTimeFormatting from 'pages/settings/yourProfile/components/DateAndTimeFormatting'
import ThemeList from 'pages/settings/yourProfile/components/ThemeList'
import { submitSetting, updateCurrentUser } from 'state/currentUser/actions'

import ForwardingCallsPreferences from './ForwardingCallsPreferences'

import css from './YourProfileView.less'

const timezones = _sortBy(
    moment.tz
        .names()
        /*
    US/Pacific-New is not supposed to be a valid timezone and as such, pytz
    (the validator on backend) doesn't allow it, so we skip it.
    More info at: https://github.com/moment/moment-timezone/issues/498
    */
        .filter((name) => name !== 'US/Pacific-New'),
    (item) => moment.tz(item).utcOffset(),
)

const timezoneToOptionMap = new global.Map(
    timezones.map((timezone) => [
        timezone,
        { value: `(UTC${moment.tz(timezone).format('Z')}) ${timezone}` },
    ]),
)

const defaultContent = {
    name: '',
    email: '',
    password_confirmation: '',
    bio: '',
    timezone: '',
    language: '',
    meta: { profile_picture_url: null },
}

type YourProfileViewFunctionalProps = {
    currentUser: Map<any, any>
    preferences: Map<any, any>
    isGorgiasAgent: boolean
}

export function YourProfileView({
    currentUser,
    preferences,
    isGorgiasAgent,
}: YourProfileViewFunctionalProps) {
    const dispatch = useAppDispatch()
    const [isFormDirty, setIsFormDirty] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const theme = useTheme()
    const setTheme = useSetTheme()

    const defaultFormValues = useMemo(() => {
        return _merge(defaultContent, {
            ...currentUser.toJS(),
            preferences: preferences.get('data').toJS(),
        })
    }, [currentUser, preferences])

    const [formValues, setFormValues] = useState(() => defaultFormValues)

    const hasChangedEmail = useMemo(() => {
        return formValues.email !== defaultFormValues.email
    }, [formValues.email, defaultFormValues.email])

    const handleSubmit = useCallback(
        async (event?: SyntheticEvent) => {
            if (event) {
                event.preventDefault()
            }

            setIsLoading(true)

            if (
                !_isEqual(defaultFormValues.preferences, formValues.preferences)
            ) {
                logEvent(SegmentEvent.UserSettingsUpdated, {
                    newSettings: formValues.preferences,
                    oldSettings: defaultFormValues.preferences,
                })
            }

            const includedKeys = Object.keys(
                _omit(defaultContent, [
                    'preferences',
                    'settings',
                    'meta',
                    'language',
                    ...(isGorgiasAgent ? ['bio', 'email', 'name'] : []),
                ]),
            )

            const normalizedValues = _pick(
                formValues,
                includedKeys,
            ) as EditableUserProfile

            const existingPreferences = currentUser
                .toJS()
                .settings?.find(
                    (setting: UserSetting) =>
                        setting.type === UserSettingType.Preferences,
                )

            await Promise.all([
                dispatch(updateCurrentUser(normalizedValues)),
                dispatch(
                    submitSetting(
                        {
                            data: formValues.preferences,
                            id: existingPreferences?.id,
                            type: UserSettingType.Preferences,
                        },
                        false,
                    ),
                ),
            ])

            setIsLoading(false)
            setIsFormDirty(false)

            const hasChangedDateFormat =
                defaultFormValues.preferences?.date_format !==
                formValues.preferences?.date_format

            const hasChangedTimeFormat =
                defaultFormValues.preferences?.time_format !==
                formValues.preferences?.time_format

            const hasChangedLanguage =
                defaultFormValues.language !== formValues.language

            // Reload the page when modifying currentUser.language (e.g. the timeformat), to refresh all moment instances
            if (
                hasChangedDateFormat ||
                hasChangedTimeFormat ||
                hasChangedLanguage
            ) {
                window.location.reload()
            }
        },
        [formValues, defaultFormValues, isGorgiasAgent, currentUser, dispatch],
    )

    const handleInputChange = useCallback(
        (name: string, value: string) => {
            setFormValues({ ...formValues, [name]: value })
            setIsFormDirty(true)
        },
        [formValues],
    )

    const handleProfilePictureChange = useCallback(
        (picture_url: string | null) => {
            const meta = {
                profile_picture_url: picture_url,
            }

            setFormValues({
                ...formValues,
                meta,
            })

            dispatch(
                updateCurrentUser({
                    meta,
                }),
            )
        },
        [formValues, dispatch],
    )

    const handleThemeChange = useCallback(
        (newTheme: HelpdeskThemeName) => {
            setTheme(newTheme)
            logEvent(SegmentEvent.ThemeUpdate, {
                theme: newTheme,
            })
        },
        [setTheme],
    )

    const handlePreferenceChange = useCallback(
        (preferenceKey: string, value: boolean | string) => {
            setFormValues({
                ...formValues,
                preferences: {
                    ...formValues.preferences,
                    [preferenceKey]: value,
                },
            })
            setIsFormDirty(true)
        },
        [formValues],
    )

    return (
        <div className="full-width">
            <UnsavedChangesPrompt
                onSave={handleSubmit}
                onDiscard={() => {
                    setFormValues(defaultFormValues)
                }}
                when={isFormDirty}
            />
            <PageHeader title="Your profile" />
            <div className={settingsCss.pageContainer}>
                <div className={settingsCss.headingSection}>
                    Personal information
                </div>
                <Form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap">
                        <div className={settingsCss.leftSideWrapper}>
                            <div className={settingsCss.section}>
                                <InputField
                                    name="name"
                                    label="Your name"
                                    placeholder="John Doe"
                                    isRequired
                                    value={formValues.name ?? ''}
                                    onChange={(name) => {
                                        handleInputChange('name', name)
                                    }}
                                    className={settingsCss.inputField}
                                    isDisabled={isGorgiasAgent}
                                />
                                <InputField
                                    type="email"
                                    name="email"
                                    label="Your email"
                                    placeholder="john.doe@acme.com"
                                    isRequired
                                    value={formValues.email ?? ''}
                                    onChange={(email) => {
                                        handleInputChange('email', email)
                                    }}
                                    className={settingsCss.inputField}
                                    isDisabled={isGorgiasAgent}
                                />
                                {hasChangedEmail ? (
                                    <InputField
                                        type="password"
                                        name="password_confirmation"
                                        label="Password confirmation"
                                        placeholder="Your password"
                                        isRequired
                                        value={
                                            formValues.password_confirmation ??
                                            ''
                                        }
                                        onChange={(password_confirmation) => {
                                            handleInputChange(
                                                'password_confirmation',
                                                password_confirmation,
                                            )
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
                                            Your bio can be used in signatures
                                            as a variable. Admins can set up
                                            signatures{' '}
                                            <Link to="/app/settings/channels/email">
                                                in each email integration
                                            </Link>
                                        </span>
                                    }
                                    value={formValues.bio ?? ''}
                                    onChange={(bio) => {
                                        handleInputChange('bio', bio)
                                    }}
                                    className={settingsCss.inputField}
                                    isDisabled={isGorgiasAgent}
                                />
                            </div>
                            <div className={settingsCss.headingSection}>
                                Date and time settings
                            </div>
                            <div className={settingsCss.section}>
                                <FormGroup className={settingsCss.inputField}>
                                    <SelectField
                                        label="Timezone"
                                        options={timezones}
                                        optionMapper={(timezone) =>
                                            timezoneToOptionMap.get(timezone)!
                                        }
                                        selectedOption={formValues.timezone}
                                        onChange={(timezone) => {
                                            handleInputChange(
                                                'timezone',
                                                timezone,
                                            )
                                        }}
                                    />
                                </FormGroup>
                                <DateAndTimeFormatting
                                    dateFormat={
                                        formValues.preferences?.date_format
                                    }
                                    timeFormat={
                                        formValues.preferences?.time_format
                                    }
                                    onSelectDateFormat={(value: string) => {
                                        handlePreferenceChange(
                                            'date_format',
                                            value,
                                        )
                                    }}
                                    onSelectTimeFormat={(value: string) => {
                                        handlePreferenceChange(
                                            'time_format',
                                            value,
                                        )
                                    }}
                                />
                            </div>
                        </div>
                        <FormGroup
                            className={classnames(
                                css.avatarContainer,
                                settingsCss.profilePicture,
                                settingsCss.inputField,
                            )}
                        >
                            <Label className="control-label">
                                Profile picture
                            </Label>

                            <Avatar
                                name={formValues.name}
                                size="xl"
                                url={
                                    formValues.meta.profile_picture_url ??
                                    undefined
                                }
                                className={settingsCss.mb16}
                            />

                            <FileField
                                returnFiles={false}
                                noPreview={true}
                                onChange={handleProfilePictureChange}
                                uploadType={UploadType.Profile}
                                maxSize={500 * 1000}
                                className={settingsCss.mb16}
                            />

                            <FormText color="muted">
                                The picture must be square and weigh less than
                                500kB.
                            </FormText>

                            {formValues.meta.profile_picture_url && (
                                <a
                                    href="#"
                                    className="text-danger"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleProfilePictureChange(null)
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
                                    savedTheme={theme.name}
                                    onChangeTheme={handleThemeChange}
                                />
                            </div>
                            <div className={settingsCss.headingSubsection}>
                                Macro display
                            </div>
                            <div className={settingsCss.subsection}>
                                <FormGroup
                                    className={classnames(
                                        settingsCss.inputField,
                                        'body-regular',
                                    )}
                                >
                                    <Group
                                        orientation="vertical"
                                        className={settingsCss.inputField}
                                    >
                                        <ToggleField
                                            name="prefill_best_macro"
                                            label={
                                                <>
                                                    <i
                                                        className={classnames(
                                                            'material-icons',
                                                            settingsCss.AIIcon,
                                                        )}
                                                    >
                                                        auto_awesome
                                                    </i>
                                                    Macro prediction
                                                </>
                                            }
                                            value={
                                                formValues.preferences
                                                    ?.prefill_best_macro
                                            }
                                            onChange={(value: boolean) => {
                                                handlePreferenceChange(
                                                    'prefill_best_macro',
                                                    value,
                                                )
                                            }}
                                        />
                                        <FormText
                                            color="muted"
                                            className={
                                                settingsCss.macroDescription
                                            }
                                        >
                                            Automatically select macros based on
                                            previous macro usage.{' '}
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
                                        <ToggleField
                                            name="show_macros_suggestions"
                                            label={
                                                <>
                                                    <i
                                                        className={classnames(
                                                            'material-icons',
                                                            settingsCss.AIIcon,
                                                        )}
                                                    >
                                                        auto_awesome
                                                    </i>
                                                    Macro suggestions
                                                </>
                                            }
                                            value={
                                                formValues.preferences
                                                    ?.show_macros_suggestions
                                            }
                                            onChange={(value: boolean) => {
                                                handlePreferenceChange(
                                                    'show_macros_suggestions',
                                                    value,
                                                )
                                            }}
                                        />

                                        <FormText
                                            color="muted"
                                            className={
                                                settingsCss.macroDescription
                                            }
                                        >
                                            Display suggested macros that can be
                                            applied to tickets with one click.{' '}
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
                                        <ToggleField
                                            name="show_macros"
                                            label="Display macro search view by default"
                                            value={
                                                formValues.preferences
                                                    ?.show_macros
                                            }
                                            onChange={(value: boolean) => {
                                                handlePreferenceChange(
                                                    'show_macros',
                                                    value,
                                                )
                                            }}
                                        ></ToggleField>
                                        <FormText
                                            color="muted"
                                            className={
                                                settingsCss.macroDescription
                                            }
                                        >
                                            Always display the macro search view
                                            when responding to incoming emails.{' '}
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
                                    formValues.preferences?.forward_calls
                                }
                                forwardingPhoneNumber={
                                    formValues.preferences
                                        ?.forwarding_phone_number
                                }
                                forwardWhenOffline={
                                    formValues.preferences?.forward_when_offline
                                }
                                setPreference={(preferenceKey, value) => {
                                    handlePreferenceChange(preferenceKey, value)
                                }}
                            />
                        </div>
                    </div>

                    <Button type="submit" isLoading={isLoading}>
                        Save Changes
                    </Button>
                </Form>
            </div>
        </div>
    )
}
