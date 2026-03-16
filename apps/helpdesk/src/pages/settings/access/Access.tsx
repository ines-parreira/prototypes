import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import classnames from 'classnames'
import type { List } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Button, Form } from 'reactstrap'

import { LegacyLabel as Label } from '@gorgias/axiom'

import googleLogo from 'assets/img/integrations/google.svg'
import microsoftLogo from 'assets/img/integrations/microsoft.svg'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Skip2faAfterSso from 'pages/settings/access/Skip2faAfterSso'
import SsoEnforcement from 'pages/settings/access/SsoEnforcement'
import TwoFactorAuthenticationEnforcement from 'pages/settings/access/TwoFactorAuthenticationEnforcement'
import { submitSetting } from 'state/currentAccount/actions'
import { UPDATE_ACCOUNT_SETTING } from 'state/currentAccount/constants'
import {
    getAccessSettings,
    getSkip2faAfterSsoDatetime,
    getSsoEnforcedDatetime,
    getTwoFAEnforcedDatetime,
} from 'state/currentAccount/selectors'
import type {
    AccountSettingAccess,
    CustomSSOProviders,
} from 'state/currentAccount/types'
import {
    AccountSettingType,
    AccountSettingAccessSignupMode as SignupMode,
} from 'state/currentAccount/types'
import type { RootState } from 'state/types'

import CustomSsoProviders from './CustomSsoProviders'
import SsoToggleButton from './SsoToggleButton'

import css from '../settings.less'

type Props = ConnectedProps<typeof connector>

enum LoadingKey {
    Settings = 'settings',
    GoogleSSO = 'sso_google',
    Office365SSO = 'sso_office_365',
    TwoFAEnforcement = 'two_fa_enforcement',
    Skip2faAfterSso = 'skip_2fa_after_sso',
    SsoEnforcement = 'sso_enforcement',
    CustomSSO = 'custom_sso',
}

const FORBIDDEN_DOMAINS = ['gmail.com', 'outlook.com']

function splitDomains(domains: string): string[] {
    return domains
        .split(/[,\n]/)
        .map((val) => val.trim())
        .filter((val) => val.length > 0)
}

function validateDomain(domain: string): string | undefined {
    if (domain.match(/^[*.]+$/)) {
        return 'You cannot use only wildcards as a domain.'
    }
    if (FORBIDDEN_DOMAINS.includes(domain)) {
        return 'Generic domain: ' + domain
    }
    if (!domain.match(/^[\w\d\-.*]+$/)) {
        return 'Invalid special character(s). Only “*” and “,” are allowed.'
    }

    // Ensure wildcards are always preceded or followed by a dot
    if (domain.match(/\*[^.]|[^.]\*/)) {
        return 'You cannot use wildcards not separated by a dot.'
    }
}

function validateDomains(domains: string): string {
    return splitDomains(domains)
        .map(validateDomain)
        .filter((error) => error !== undefined)
        .join('\n')
}

function hasDispatchResultType(value: unknown): value is { type: string } {
    return (
        value !== null &&
        typeof value === 'object' &&
        'type' in value &&
        typeof value.type === 'string'
    )
}

export const AccessContainer = (props: Props) => {
    const { accountDomain, accessSettings, submitSetting } = props
    const { value: isSsoEnforcementEnabled } = useFlagWithLoading(
        FeatureFlagKey.SsoEnforcement,
        false,
    )

    const allowedDomainsSetting: string[] =
        (
            accessSettings.getIn(['data', 'allowed_domains']) as List<string>
        )?.toArray() || []
    const signupModeSetting: SignupMode =
        accessSettings.getIn(['data', 'signup_mode']) || SignupMode.Invite
    const googleSsoEnabled: boolean = accessSettings.getIn(
        ['data', 'google_sso_enabled'],
        false,
    )
    const office365SsoEnabled: boolean = accessSettings.getIn(
        ['data', 'office365_sso_enabled'],
        false,
    )
    const customSsoProviders: CustomSSOProviders = accessSettings
        .getIn(['data', 'custom_sso_providers'], {})
        .toJS()
    const twoFAEnforcedDatetime = useAppSelector(getTwoFAEnforcedDatetime)
    const skip2faAfterSsoDatetime = useAppSelector(getSkip2faAfterSsoDatetime)
    const ssoEnforcedDatetime = useAppSelector(getSsoEnforcedDatetime)

    const [isLoading, setIsLoading] = useState<LoadingKey>()
    const [signupMode, setSignupMode] = useState(signupModeSetting)
    const [allowedDomains, setAllowedDomains] = useState(() =>
        allowedDomainsSetting.join('\n'),
    )
    const [showCustomSSOModal, setShowCustomSSOModal] = useState(false)

    const domainError =
        validateDomains(allowedDomains) ||
        (signupMode === SignupMode.AllowedDomains && !allowedDomains
            ? 'This field is required if Auto-join is enabled.'
            : null)

    const signupLink = `https://${accountDomain}.gorgias.com/signup`

    const saveSettings = useCallback(
        async (
            loadingKey: LoadingKey,
            overrides?: Partial<AccountSettingAccess['data']>,
            notification?: string,
        ) => {
            const data = {
                signup_mode: signupMode,
                allowed_domains: splitDomains(allowedDomains),
                google_sso_enabled: googleSsoEnabled,
                office365_sso_enabled: office365SsoEnabled,
                two_fa_enforced_datetime: twoFAEnforcedDatetime,
                skip_2fa_after_sso_datetime: skip2faAfterSsoDatetime,
                sso_enforced_datetime: ssoEnforcedDatetime,
                custom_sso_providers: customSsoProviders,
            }

            setIsLoading(loadingKey)
            const result = await submitSetting(
                {
                    id: accessSettings.get('id'),
                    type: AccountSettingType.Access,
                    data: { ...data, ...overrides },
                },
                notification,
            )
            setIsLoading(undefined)
            const success =
                hasDispatchResultType(result) &&
                result.type === UPDATE_ACCOUNT_SETTING
            return success
        },
        [
            allowedDomains,
            signupMode,
            submitSetting,
            accessSettings,
            googleSsoEnabled,
            office365SsoEnabled,
            twoFAEnforcedDatetime,
            skip2faAfterSsoDatetime,
            ssoEnforcedDatetime,
            customSsoProviders,
        ],
    )

    const toggleGoogleSso = useCallback(
        (val: boolean) => {
            return saveSettings(
                LoadingKey.GoogleSSO,
                { google_sso_enabled: val },
                `Google Single Sign-On successfully ${
                    val ? 'activated' : 'deactivated'
                }`,
            )
        },
        [saveSettings],
    )

    const toggleOffice365Sso = useCallback(
        (val: boolean) => {
            return saveSettings(
                LoadingKey.Office365SSO,
                { office365_sso_enabled: val },
                `Microsoft 365 Single Sign-On successfully ${
                    val ? 'activated' : 'deactivated'
                }`,
            )
        },
        [saveSettings],
    )

    const toggleSignupModeAllowedDomains = useCallback((val: boolean) => {
        if (val) {
            setSignupMode(SignupMode.AllowedDomains)
        } else {
            setSignupMode(SignupMode.Invite)
        }
    }, [])

    const toggle2FAEnforcement = useCallback(
        (val: string | null) => {
            return saveSettings(
                LoadingKey.TwoFAEnforcement,
                {
                    two_fa_enforced_datetime: val,
                },
                `Two-Factor Authentication ${
                    val
                        ? 'successfully enforced for all users.'
                        : 'has successfully been made optional.'
                }`,
            )
        },
        [saveSettings],
    )

    const toggleSkip2faAfterSso = useCallback(
        (val: string | null) => {
            return saveSettings(
                LoadingKey.Skip2faAfterSso,
                {
                    skip_2fa_after_sso_datetime: val,
                },
                `Skip 2FA after SSO ${
                    val ? 'successfully enabled.' : 'has been disabled.'
                }`,
            )
        },
        [saveSettings],
    )

    const toggleSsoEnforcement = useCallback(
        (val: string | null) => {
            return saveSettings(
                LoadingKey.SsoEnforcement,
                {
                    sso_enforced_datetime: val,
                },
                `SSO ${
                    val
                        ? 'successfully enforced for all users.'
                        : 'enforcement has been disabled.'
                }`,
            )
        },
        [saveSettings],
    )

    const handleCustomSsoProvidersUpdate = useCallback(
        (providers: CustomSSOProviders) => {
            return saveSettings(
                LoadingKey.CustomSSO,
                {
                    custom_sso_providers: providers,
                },
                'Custom SSO providers successfully updated',
            )
        },
        [saveSettings],
    )

    const handleSubmit = useCallback(
        (evt: FormEvent) => {
            evt.preventDefault()
            return saveSettings(LoadingKey.Settings)
        },
        [saveSettings],
    )

    return (
        <div className="full-width">
            <PageHeader title="Access management" />

            <div className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <Form onSubmit={handleSubmit}>
                        <h4 className="mb-2">Single Sign-On (SSO)</h4>
                        <p>
                            SSO allows agents to access Gorgias using their
                            Google or Microsoft accounts. Once you enable a SSO
                            method, a respective button will appear on the
                            log-in page.
                        </p>
                        <div className="mb-4">
                            <SsoToggleButton
                                id="google"
                                name="Google"
                                logo={googleLogo}
                                value={googleSsoEnabled}
                                loading={isLoading === LoadingKey.GoogleSSO}
                                disabled={
                                    !showCustomSSOModal &&
                                    !!isLoading &&
                                    isLoading !== LoadingKey.GoogleSSO
                                }
                                setValue={toggleGoogleSso}
                            />
                        </div>
                        <SsoToggleButton
                            id="office365"
                            name="Microsoft 365"
                            logo={microsoftLogo}
                            value={office365SsoEnabled}
                            loading={isLoading === LoadingKey.Office365SSO}
                            disabled={
                                !showCustomSSOModal &&
                                !!isLoading &&
                                isLoading !== LoadingKey.Office365SSO
                            }
                            setValue={toggleOffice365Sso}
                        />

                        <CustomSsoProviders
                            providers={customSsoProviders}
                            accountDomain={accountDomain}
                            onUpdate={handleCustomSsoProvidersUpdate}
                            isLoading={!!isLoading}
                            showModal={showCustomSSOModal}
                            setShowModal={setShowCustomSSOModal}
                        />

                        {(isSsoEnforcementEnabled || !!ssoEnforcedDatetime) && (
                            <SsoEnforcement
                                ssoEnforcedDatetime={ssoEnforcedDatetime}
                                loading={
                                    isLoading === LoadingKey.SsoEnforcement
                                }
                                disabled={
                                    !showCustomSSOModal &&
                                    !!isLoading &&
                                    isLoading !== LoadingKey.SsoEnforcement
                                }
                                googleSsoEnabled={googleSsoEnabled}
                                office365SsoEnabled={office365SsoEnabled}
                                hasCustomSsoProviders={
                                    Object.keys(customSsoProviders).length > 0
                                }
                                onSsoEnforced={toggleSsoEnforcement}
                            />
                        )}

                        <h4 className="mt-5 mb-2">Auto-join helpdesk</h4>
                        <p className="mb-1">
                            Allows people with email addresses in the approved
                            email domains to use the link below to sign up.
                        </p>
                        <p>
                            <a href={signupLink}>{signupLink}</a>
                        </p>
                        <div className="mb-3">
                            <ToggleInput
                                isToggled={
                                    signupMode === SignupMode.AllowedDomains
                                }
                                onClick={toggleSignupModeAllowedDomains}
                            >
                                Auto-join for approved email domains
                            </ToggleInput>
                        </div>
                        <div className="mb-10">
                            <Label
                                htmlFor={'approved-email-domains'}
                                isRequired
                                className="mb-2"
                            >
                                {'Approved email domains'}
                            </Label>
                            <DEPRECATED_InputField
                                id={'approved-email-domains'}
                                error={domainError}
                                type="textarea"
                                rows={Math.max(
                                    allowedDomainsSetting.length + 1,
                                    1,
                                )}
                                help={
                                    !domainError
                                        ? 'Wildcards allowed (e.g. *.domain.com)'
                                        : null
                                }
                                placeholder="domain.com, mydomain.com"
                                value={allowedDomains}
                                onChange={setAllowedDomains}
                                readOnly={
                                    signupMode !== SignupMode.AllowedDomains
                                }
                            />
                        </div>

                        <TwoFactorAuthenticationEnforcement
                            twoFAEnforcedDatetime={twoFAEnforcedDatetime}
                            loading={isLoading === LoadingKey.TwoFAEnforcement}
                            disabled={
                                !showCustomSSOModal &&
                                !!isLoading &&
                                isLoading !== LoadingKey.TwoFAEnforcement
                            }
                            on2FAEnforced={toggle2FAEnforcement}
                        />

                        <Skip2faAfterSso
                            skip2faAfterSsoDatetime={skip2faAfterSsoDatetime}
                            loading={isLoading === LoadingKey.Skip2faAfterSso}
                            disabled={
                                !showCustomSSOModal &&
                                !!isLoading &&
                                isLoading !== LoadingKey.Skip2faAfterSso
                            }
                            googleSsoEnabled={googleSsoEnabled}
                            office365SsoEnabled={office365SsoEnabled}
                            hasCustomSsoProviders={
                                Object.keys(customSsoProviders).length > 0
                            }
                            onToggle={toggleSkip2faAfterSso}
                        />

                        <Button
                            type="submit"
                            color="primary"
                            className={classnames({
                                'btn-loading':
                                    isLoading === LoadingKey.Settings,
                            })}
                            disabled={
                                (!showCustomSSOModal && !!isLoading) ||
                                (signupMode === SignupMode.AllowedDomains &&
                                    !!domainError)
                            }
                        >
                            Save changes
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        accessSettings: getAccessSettings(state),
        accountDomain: state.currentAccount.get('domain') as string,
    }),
    {
        submitSetting,
    },
)

export default connector(AccessContainer)
