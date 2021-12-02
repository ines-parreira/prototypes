import React, {FormEvent, useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Col, Container, Form, Row} from 'reactstrap'

import {RootState} from '../../../state/types'
import {submitSetting} from '../../../state/currentAccount/actions'
import {getAccessSettings} from '../../../state/currentAccount/selectors'
import {
    AccountSettingAccessSignupMode as SignupMode,
    AccountSettingType,
} from '../../../state/currentAccount/types'

import PageHeader from '../../common/components/PageHeader'
import RadioField from '../../common/forms/RadioField'
import InputField from '../../common/forms/InputField'

type Props = ConnectedProps<typeof connector>

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

    const [isLoading, setIsLoading] = useState(false)
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

    const handleSubmit = useCallback(
        async (evt: FormEvent) => {
            evt.preventDefault()

            setIsLoading(true)
            await submitSetting({
                id: accessSettings.get('id'),
                type: AccountSettingType.Access,
                data: {
                    signup_mode: signupMode,
                    allowed_domains: splitDomains(allowedDomains),
                },
            })
            setIsLoading(false)
        },
        [allowedDomains, signupMode, submitSetting, accessSettings]
    )

    return (
        <div className="full-width">
            <PageHeader title="Access management" />

            <Container fluid className="page-container">
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-2">
                        <Col md="6">
                            <h4 className="mb-2">
                                <i className="material-icons mr-1">mail</i>
                                Joining the helpdesk
                            </h4>
                            <p>
                                If you allow people to join automatically,
                                anyone with an approved email address can use
                                this link to confirm their email and sign up:{' '}
                                <a href={signupLink}>{signupLink}</a>
                            </p>
                            <RadioField
                                onChange={setSignupMode}
                                value={signupMode}
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
                        </Col>
                    </Row>

                    <Button
                        type="submit"
                        color="primary"
                        className={classnames({
                            'btn-loading': isLoading,
                        })}
                        disabled={
                            isLoading ||
                            (signupMode === SignupMode.AllowedDomains &&
                                !!domainError)
                        }
                    >
                        Save changes
                    </Button>
                </Form>
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
