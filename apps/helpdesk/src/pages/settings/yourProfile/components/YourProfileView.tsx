import type { SyntheticEvent } from 'react'
import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _sortBy from 'lodash/sortBy'
import moment from 'moment-timezone'
import { Link } from 'react-router-dom'
import { Form, FormGroup, FormText } from 'reactstrap'

import {
    Avatar,
    Button,
    LegacyLabel as Label,
    LegacySelectField as SelectField,
    LegacyToggleField as ToggleField,
} from '@gorgias/axiom'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { UserLanguagePreferencesSetting } from '@gorgias/helpdesk-types'

import { UploadType } from 'common/types'
import { TranslationSupportedLanguagesInEnglish } from 'constants/languages'
import { useSetTheme, useTheme } from 'core/theme'
import type { HelpdeskThemeName } from 'core/theme'
import Group from 'pages/common/components/layout/Group'
import PageHeader from 'pages/common/components/PageHeader'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import Caption from 'pages/common/forms/Caption/Caption'
import FileField from 'pages/common/forms/FileField'
import InputField from 'pages/common/forms/input/InputField'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import settingsCss from 'pages/settings/settings.less'
import DateAndTimeFormatting from 'pages/settings/yourProfile/components/DateAndTimeFormatting'
import ThemeList from 'pages/settings/yourProfile/components/ThemeList'

import { useScrollToHash } from '../hooks/useScrollToHash'
import { useUpdateCurrentUserProfilePicture } from '../hooks/useUpdateCurrentUserProfile'
import { useYourProfileForm } from '../hooks/useYourProfileForm'
import { useYourProfileMutations } from '../hooks/useYourProfileMutations'
import type { ApplicationUserPreferencesSettings, CurrentUser } from '../types'
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

const translationLanguageOptions = TranslationSupportedLanguagesInEnglish.map(
    ({ code, name }) => ({
        icon: undefined,
        value: code,
        name: name,
    }),
)

const allProficientLanguagesOptions =
    TranslationSupportedLanguagesInEnglish.map(({ code, name }) => ({
        value: code,
        label: name,
    })) as Option[]

type YourProfileViewFunctionalProps = {
    currentUser: Partial<CurrentUser['data']>
    settingsPreferences?: ApplicationUserPreferencesSettings
    languagePreferences?: UserLanguagePreferencesSetting
    isGorgiasAgent: boolean
}

export function YourProfileView({
    currentUser,
    settingsPreferences,
    languagePreferences,
    isGorgiasAgent,
}: YourProfileViewFunctionalProps) {
    const hasMessagesTranslations = useFlag(FeatureFlagKey.MessagesTranslations)
    useScrollToHash()
    const queryClient = useQueryClient()
    const { mutateAsync: updateCurrentUserProfilePicture } =
        useUpdateCurrentUserProfilePicture()

    const {
        isFormDirty,
        setIsFormDirty,
        isLoading,
        setIsLoading,
        formValues,
        setFormValues,
        defaultFormValues,
        handleInputChange,
        handlePreferenceChange,
        handlePrimaryLanguageChange,
        handleProficientLanguagesChange,
        handleProficientLanguagesInputChange,
        proficientLanguagesOptions,
    } = useYourProfileForm({
        currentUser,
        settingsPreferences,
        languagePreferences,
    })

    const {
        handleLanguagePreferenceSubmit,
        handleSettingsPreferenceSubmit,
        handleUserInfoSubmit,
    } = useYourProfileMutations({
        formValues,
        defaultFormValues,
        languagePreferences,
        settingsPreferences,
        isGorgiasAgent,
    })

    const theme = useTheme()
    const setTheme = useSetTheme()

    const hasChangedEmail = useMemo(
        () => formValues.email !== defaultFormValues.email,
        [formValues.email, defaultFormValues.email],
    )

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

            try {
                await Promise.all([
                    handleUserInfoSubmit(),
                    handleSettingsPreferenceSubmit(),
                    handleLanguagePreferenceSubmit(),
                ])
            } catch {}

            setIsLoading(false)
            setIsFormDirty(false)

            await queryClient.invalidateQueries({
                queryKey: queryKeys.account.getCurrentUser(),
            })
        },
        [
            formValues,
            defaultFormValues,
            handleUserInfoSubmit,
            handleSettingsPreferenceSubmit,
            handleLanguagePreferenceSubmit,
            queryClient,
            setIsLoading,
            setIsFormDirty,
        ],
    )

    const handleProfilePictureChange = useCallback(
        async (picture_url: string | null) => {
            const meta = {
                profile_picture_url: picture_url,
            }

            setFormValues({
                ...formValues,
                meta,
            })

            updateCurrentUserProfilePicture({
                meta,
            })
            await queryClient.invalidateQueries({
                queryKey: [queryKeys.account.getCurrentUser()],
            })
        },
        [
            formValues,
            updateCurrentUserProfilePicture,
            queryClient,
            setFormValues,
        ],
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
                <h2
                    id="personal-information"
                    className={classnames(
                        settingsCss.headingSection,
                        css.headings,
                    )}
                >
                    Personal information
                </h2>
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
                            {hasMessagesTranslations && (
                                <>
                                    <h3
                                        id="theme"
                                        className={classnames(
                                            settingsCss.headingSubsection,
                                            css.headings,
                                        )}
                                    >
                                        Theme
                                    </h3>
                                    <div className={settingsCss.section}>
                                        <ThemeList
                                            savedTheme={theme.name}
                                            onChangeTheme={handleThemeChange}
                                        />
                                    </div>
                                </>
                            )}

                            <h2
                                id="date-and-time-settings"
                                className={classnames(
                                    settingsCss.headingSection,
                                    css.headings,
                                )}
                            >
                                Date and time settings
                            </h2>
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
                                        formValues.preferences?.date_format ??
                                        ''
                                    }
                                    timeFormat={
                                        formValues.preferences?.time_format ??
                                        ''
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
                                size="xxl"
                                url={
                                    formValues.meta.profile_picture_url ??
                                    undefined
                                }
                            />

                            <FileField
                                id="profile-picture-input"
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
                        {!hasMessagesTranslations && (
                            <h2
                                id="account-preferences"
                                className={classnames(
                                    settingsCss.headingSection,
                                    css.headings,
                                )}
                            >
                                Account preferences
                            </h2>
                        )}

                        {hasMessagesTranslations && (
                            <div className={settingsCss.section}>
                                <h3
                                    id="translation-settings"
                                    className={classnames(
                                        settingsCss.headingSubsection,
                                        css.headings,
                                    )}
                                >
                                    Ticket translation settings
                                </h3>
                                <div className={settingsCss.subsection}>
                                    <FormGroup
                                        className={css.conversationSettings}
                                    >
                                        <div data-testid="enable-ticket-translations">
                                            <ToggleField
                                                name="enabled"
                                                label="Enable ticket translations"
                                                value={
                                                    formValues.preferences
                                                        ?.enabled ?? false
                                                }
                                                onChange={(value: boolean) => {
                                                    handlePreferenceChange(
                                                        'enabled',
                                                        value,
                                                    )
                                                }}
                                            ></ToggleField>
                                        </div>
                                        <div data-testid="default-translation-language">
                                            <SelectField<
                                                (typeof translationLanguageOptions)[number]
                                            >
                                                label="Default translation language"
                                                options={
                                                    translationLanguageOptions
                                                }
                                                isDisabled={
                                                    !formValues.preferences
                                                        .enabled
                                                }
                                                selectedOption={translationLanguageOptions.find(
                                                    (option) =>
                                                        formValues.preferences
                                                            .primary ===
                                                        option.value,
                                                )}
                                                optionMapper={(option) => ({
                                                    value: option.name,
                                                })}
                                                onChange={
                                                    handlePrimaryLanguageChange
                                                }
                                            />
                                            <Caption>
                                                Choose the default language
                                                you&apos;d like to translate
                                                into.
                                            </Caption>
                                        </div>

                                        <div
                                            data-testid="proficient-languages"
                                            className={css.proficientLanguages}
                                        >
                                            <Label htmlFor="proficient-languages">
                                                Languages you know
                                            </Label>
                                            <MultiSelectOptionsField
                                                id="proficient-languages"
                                                plural="Languages"
                                                showAllOptions
                                                isDisabled={
                                                    !formValues.preferences
                                                        .enabled
                                                }
                                                onInputChange={
                                                    handleProficientLanguagesInputChange
                                                }
                                                options={
                                                    proficientLanguagesOptions
                                                }
                                                selectedOptions={
                                                    formValues.preferences.proficient.map(
                                                        (value) =>
                                                            allProficientLanguagesOptions.find(
                                                                (option) =>
                                                                    option.value ===
                                                                    value,
                                                            ),
                                                    ) as Option[]
                                                }
                                                onChange={
                                                    handleProficientLanguagesChange
                                                }
                                            />
                                            <Caption>
                                                Messages received in these
                                                languages will not be
                                                auto-translated
                                            </Caption>
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>
                        )}

                        <div className={settingsCss.section}>
                            {!hasMessagesTranslations && (
                                <>
                                    <h3
                                        id="theme"
                                        className={classnames(
                                            settingsCss.headingSubsection,
                                            css.headings,
                                        )}
                                    >
                                        Theme
                                    </h3>
                                    <div className={settingsCss.section}>
                                        <ThemeList
                                            savedTheme={theme.name}
                                            onChangeTheme={handleThemeChange}
                                        />
                                    </div>
                                </>
                            )}

                            <h3
                                className={classnames(
                                    settingsCss.headingSubsection,
                                    css.headings,
                                )}
                            >
                                Macro display
                            </h3>
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
                                                    ?.prefill_best_macro ??
                                                false
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
                                                    ?.show_macros_suggestions ??
                                                false
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
                                                    ?.show_macros ?? false
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
                                    handlePreferenceChange(
                                        preferenceKey as keyof typeof formValues.preferences,
                                        value,
                                    )
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
