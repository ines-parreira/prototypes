import React, {FormEvent, useCallback, useState} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Container, Form} from 'reactstrap'

import {List} from 'immutable'
import googleLogo from 'assets/img/integrations/google.svg'
import microsoftLogo from 'assets/img/integrations/microsoft.svg'
import PageHeader from 'pages/common/components/PageHeader'
import {submitSetting} from 'state/currentAccount/actions'
import {
    getAccessSettings,
    getTwoFAEnforcedDatetime,
} from 'state/currentAccount/selectors'
import {RootState} from 'state/types'
import {
    AccountSettingAccess,
    AccountSettingAccessSignupMode as SignupMode,
    AccountSettingType,
} from 'state/currentAccount/types'
import TwoFactorAuthenticationEnforcement from 'pages/settings/access/TwoFactorAuthenticationEnforcement'
import useAppSelector from 'hooks/useAppSelector'
import ToggleInput from 'pages/common/forms/ToggleInput'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import Label from 'pages/common/forms/Label/Label'
import css from '../settings.less'
import SsoToggleButton from './SsoToggleButton'

type Props = ConnectedProps<typeof connector>

enum LoadingKey {
    Settings = 'settings',
    GoogleSSO = 'sso_google',
    Office365SSO = 'sso_office_365',
    TwoFAEnforcement = 'two_fa_enforcement',
}

const FORBIDDEN_DOMAINS = ['gmail.com', 'outlook.com']

function splitDomains(domains: string): string[] {
    return domains
        .split(/[,\n]/)
        .map((val) => val.trim())
        .filter((val) => val.length > 0)
}

function validateDomain(domain: string): string | undefined {
    if (FORBIDDEN_DOMAINS.includes(domain)) {
        return 'Generic domain: ' + domain
    }
    if (!domain.match(/^[\w\d\-.*]+$/)) {
        return 'Invalid special character(s). Only “*” and “,” are allowed.'
    }
}

function validateDomains(domains: string): string {
    return splitDomains(domains)
        .map(validateDomain)
        .filter((error) => error !== undefined)
        .join('\n')
}

export const AccessContainer = (props: Props) => {
    const {accountDomain, accessSettings, submitSetting} = props

    const allowedDomainsSetting: string[] =
        (
            accessSettings.getIn(['data', 'allowed_domains']) as List<string>
        )?.toArray() || []
    const signupModeSetting: SignupMode =
        accessSettings.getIn(['data', 'signup_mode']) || SignupMode.Invite
    const googleSsoEnabled: boolean = accessSettings.getIn(
        ['data', 'google_sso_enabled'],
        false
    )
    const office365SsoEnabled: boolean = accessSettings.getIn(
        ['data', 'office365_sso_enabled'],
        false
    )
    const twoFAEnforcedDatetime = useAppSelector(getTwoFAEnforcedDatetime)

    const [isLoading, setIsLoading] = useState<LoadingKey>()
    const [signupMode, setSignupMode] = useState(signupModeSetting)
    const [allowedDomains, setAllowedDomains] = useState(
        allowedDomainsSetting.join('\n')
    )

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
            notification?: string
        ) => {
            const data = {
                signup_mode: signupMode,
                allowed_domains: splitDomains(allowedDomains),
                google_sso_enabled: googleSsoEnabled,
                office365_sso_enabled: office365SsoEnabled,
                two_fa_enforced_datetime: twoFAEnforcedDatetime,
            }

            setIsLoading(loadingKey)
            await submitSetting(
                {
                    id: accessSettings.get('id'),
                    type: AccountSettingType.Access,
                    data: {...data, ...overrides},
                },
                notification
            )
            setIsLoading(undefined)
        },
        [
            allowedDomains,
            signupMode,
            submitSetting,
            accessSettings,
            googleSsoEnabled,
            office365SsoEnabled,
            twoFAEnforcedDatetime,
        ]
    )

    const toggleGoogleSso = useCallback(
        (val: boolean) => {
            return saveSettings(
                LoadingKey.GoogleSSO,
                {google_sso_enabled: val},
                `Google Single Sign-On successfully ${
                    val ? 'activated' : 'deactivated'
                }`
            )
        },
        [saveSettings]
    )

    const toggleOffice365Sso = useCallback(
        (val: boolean) => {
            return saveSettings(
                LoadingKey.Office365SSO,
                {office365_sso_enabled: val},
                `Microsoft 365 Single Sign-On successfully ${
                    val ? 'activated' : 'deactivated'
                }`
            )
        },
        [saveSettings]
    )

    const toggleSignupModeAllowedDomains = useCallback((val: boolean) => {
        if (val) {
            setSignupMode(SignupMode.AllowedDomains)
        } else {
            setSignupMode(SignupMode.Invite)
        }
    }, [])

    const toggle2FAEnforcement = useCallback(
        (val: boolean) => {
            return saveSettings(
                LoadingKey.TwoFAEnforcement,
                {
                    two_fa_enforced_datetime: val
                        ? new Date().toISOString().split('.')[0]
                        : null,
                },
                `Two-Factor Authentication ${
                    val
                        ? 'successfully enforced for all users.'
                        : 'has successfully been made optional.'
                }`
            )
        },
        [saveSettings]
    )

    const handleSubmit = useCallback(
        (evt: FormEvent) => {
            evt.preventDefault()
            return saveSettings(LoadingKey.Settings)
        },
        [saveSettings]
    )

    return (
        <div className="full-width">
            <PageHeader title="Access management" />

            <Container fluid className={css.pageContainer}>
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
                                !!isLoading &&
                                isLoading !== LoadingKey.Office365SSO
                            }
                            setValue={toggleOffice365Sso}
                        />

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
                                    1
                                )}
                                help={
                                    !domainError
                                        ? 'Wildcards allowed (e.g. *domain.com)'
                                        : null
                                }
                                placeholder="domain.com, mydomain.com"
                                value={allowedDomains}
                                onChange={setAllowedDomains}
                                isRequired
                                readOnly={
                                    signupMode !== SignupMode.AllowedDomains
                                }
                            />
                        </div>

                        <TwoFactorAuthenticationEnforcement
                            is2FAEnforced={!!twoFAEnforcedDatetime}
                            loading={isLoading === LoadingKey.TwoFAEnforcement}
                            disabled={
                                !!isLoading &&
                                isLoading !== LoadingKey.TwoFAEnforcement
                            }
                            on2FAEnforced={toggle2FAEnforcement}
                        />

                        <Button
                            type="submit"
                            color="primary"
                            className={classnames({
                                'btn-loading':
                                    isLoading === LoadingKey.Settings,
                            })}
                            disabled={
                                !!isLoading ||
                                (signupMode === SignupMode.AllowedDomains &&
                                    !!domainError)
                            }
                        >
                            Save changes
                        </Button>
                    </Form>
                </div>
            </Container>
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
    }
)

export default connector(AccessContainer)
