import React, {FormEvent, useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Container, Form} from 'reactstrap'

import googleLogo from 'assets/img/integrations/google.svg'
import microsoftLogo from 'assets/img/integrations/microsoft.svg'
import InputField from 'pages/common/forms/InputField'
import PageHeader from 'pages/common/components/PageHeader'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import {submitSetting} from 'state/currentAccount/actions'
import {getAccessSettings} from 'state/currentAccount/selectors'
import {RootState} from 'state/types'
import {
    AccountSettingAccess,
    AccountSettingAccessSignupMode as SignupMode,
    AccountSettingType,
} from 'state/currentAccount/types'
import css from '../settings.less'
import SsoToggleButton from './SsoToggleButton'

type Props = ConnectedProps<typeof connector>

enum LoadingKey {
    Settings = 'settings',
    GoogleSSO = 'sso_google',
    Office365SSO = 'sso_office_365',
}

const FORBIDDEN_DOMAINS = ['gmail.com', 'outlook.com']

function splitDomains(domains: string): string[] {
    return domains
        .split('\n')
        .map((val) => val.trim())
        .filter((val) => val.length > 0)
}

function validateDomain(domain: string): string | undefined {
    if (FORBIDDEN_DOMAINS.includes(domain)) {
        return 'Generic domain: ' + domain
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
        accessSettings.getIn(['data', 'allowed_domains']) || []
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

    const [isLoading, setIsLoading] = useState<LoadingKey>()
    const [signupMode, setSignupMode] = useState(signupModeSetting)
    const [allowedDomains, setAllowedDomains] = useState(
        allowedDomainsSetting.join('\n')
    )
    const [domainError, setDomainError] = useState(
        validateDomains(allowedDomains)
    )
    useEffect(() => {
        setDomainError(validateDomains(allowedDomains))
    }, [allowedDomains])

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
                        <h4 className="mb-2">
                            <i className="material-icons mr-1">vpn_key</i>
                            Single Sign-On (SSO)
                        </h4>
                        <p>
                            SSO allows team members to access Gorgias using
                            their Google or Microsoft 365 accounts. Once you
                            enable SSO, a Google or Microsoft login button will
                            be added to the login page.
                        </p>
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

                        <h4 className="mt-5 mb-2">
                            <i className="material-icons mr-1">mail</i>
                            Joining the helpdesk
                        </h4>
                        <p>
                            If you allow people to join automatically, anyone
                            with an approved email address can use this link to
                            confirm their email and sign up:{' '}
                            <a href={signupLink}>{signupLink}</a>
                        </p>
                        <RadioFieldSet
                            className="mb-3"
                            onChange={(value) =>
                                setSignupMode(value as SignupMode)
                            }
                            selectedValue={signupMode}
                            options={[
                                {
                                    value: SignupMode.Invite,
                                    label: 'Invite people manually',
                                },
                                {
                                    value: SignupMode.AllowedDomains,
                                    label: 'Let people sign up automatically, and only accept email addresses from specific domains',
                                },
                            ]}
                        />
                        {signupMode === SignupMode.AllowedDomains && (
                            <InputField
                                error={domainError}
                                type="textarea"
                                help="Ex: domain.com, *.domain.com. Wildcards allowed. Use separate lines for multiple entries."
                                value={allowedDomains}
                                onChange={setAllowedDomains}
                            />
                        )}

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
