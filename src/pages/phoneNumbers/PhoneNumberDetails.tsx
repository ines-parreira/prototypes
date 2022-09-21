import React, {useState, useEffect} from 'react'
import {
    Col,
    Row,
    Form,
    InputGroupAddon,
    InputGroup,
    Input,
    Label,
    FormGroup,
} from 'reactstrap'
import {Link} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import Clipboard from 'clipboard'
import classnames from 'classnames'

import {PhoneNumber, PhoneCountry} from 'models/phoneNumber/types'
import {
    updatePhoneNumber,
    deletePhoneNumber,
} from 'models/phoneNumber/resources'
import {GorgiasApiError} from 'models/api/types'
import {
    phoneNumberUpdated,
    phoneNumberDeleted,
} from 'state/entities/phoneNumbers/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {IntegrationType} from 'models/integration/types'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import {hasCapability} from 'pages/phoneNumbers/utils'
import history from 'pages/history'
import {errorToChildren} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'

import css from './PhoneNumberDetails.less'

import rawCountries from './options/countries.json'
import rawStates from './options/states.json'

type Props = {
    phoneNumber: PhoneNumber
}

type States = {
    [key: string]: SelectableOption[]
}

const countries: SelectableOption[] = rawCountries
const states: States = rawStates

export function PhoneNumberDetails({phoneNumber}: Props) {
    const dispatch = useAppDispatch()
    const [name, setName] = useState(phoneNumber.name)
    const state =
        phoneNumber.meta?.country === PhoneCountry.US
            ? states[phoneNumber.meta.country].find(
                  (c) => c.value === phoneNumber.meta.state
              )?.label || ''
            : ''
    const [isPhoneNumberCopied, setIsPhoneNumberCopied] = useState(false)
    const countryName = phoneNumber.meta.country
        ? countries.find((c) => c.value === phoneNumber.meta.country)?.label ??
          phoneNumber.meta.country
        : ''

    const [{loading: isDeletePending}, handleDelete] = useAsyncFn(async () => {
        try {
            await deletePhoneNumber(phoneNumber.id)
            dispatch(phoneNumberDeleted(phoneNumber.id))
            void dispatch(
                notify({
                    message: 'Successfully deleted phone number',
                    status: NotificationStatus.Success,
                })
            )
            history.push('/app/settings/phone-numbers')
        } catch (error) {
            void dispatch(
                notify({
                    title: (error as GorgiasApiError).response.data.error.msg,
                    message: errorToChildren(error)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [phoneNumber])

    const VoiceIntegration = phoneNumber.integrations.find(
        (integration) => integration.type === IntegrationType.Phone
    )
    const smsApp = phoneNumber.integrations.find(
        (integration) => integration.type === IntegrationType.Sms
    )

    useEffect(() => {
        const clipboard = new Clipboard('.copy-phone-number-button')

        clipboard.on('success', () => {
            setIsPhoneNumberCopied(true)

            setTimeout(() => {
                setIsPhoneNumberCopied(false)
            }, 1500)
        })

        return () => {
            clipboard.destroy()
        }
    }, [])

    const [{loading: isLoading}, handleSubmit] = useAsyncFn(
        async (event: React.FormEvent) => {
            event.preventDefault()
            try {
                const res = await updatePhoneNumber({...phoneNumber, name})
                if (!res) {
                    return
                }
                dispatch(phoneNumberUpdated(res))
                void dispatch(
                    notify({
                        message: 'Successfully updated phone number',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to update phone number',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [phoneNumber, name, dispatch]
    )

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col lg={6} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label htmlFor="name" className="control-label">
                            Title
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            placeholder="Ex: Company Support Line"
                            required
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="phone-number" className="control-label">
                            Phone number
                        </Label>
                        <InputGroup>
                            <Input
                                id="phone-number"
                                type="text"
                                value={phoneNumber.meta?.friendly_name}
                                readOnly
                            />
                            <InputGroupAddon addonType="append">
                                <Button
                                    style={{height: '100%'}}
                                    className="copy-phone-number-button"
                                    data-clipboard-target="#phone-number"
                                >
                                    <i className="material-icons mr-2">
                                        file_copy
                                    </i>
                                    {isPhoneNumberCopied ? 'Copied!' : 'Copy'}
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col lg={3} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label className="control-label">Country</Label>
                        <Input value={countryName as string} readOnly />
                    </FormGroup>
                </Col>
                <Col lg={3} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label className="control-label">Type</Label>
                        <Input value={phoneNumber.meta?.type} readOnly />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                {state && (
                    <Col lg={3} className="pr-lg-0 pr-md-3">
                        <FormGroup>
                            <Label className="control-label">State</Label>
                            <Input value={state as string} readOnly />
                        </FormGroup>
                    </Col>
                )}
                <Col lg={3} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label className="control-label">Area Code</Label>
                        <Input value={phoneNumber.meta?.area_code} readOnly />
                    </FormGroup>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col lg={6} className="pr-lg-0 pr-md-3">
                    <h4 className="mb-3">Connected integrations</h4>
                    <Row
                        className={classnames(
                            css.appRow,
                            'border-bottom',
                            'ml-1',
                            'mr-1',
                            {
                                [css.disabledApp]:
                                    !VoiceIntegration ||
                                    !hasCapability(
                                        phoneNumber,
                                        IntegrationType.Phone
                                    ),
                            }
                        )}
                    >
                        <Col lg={8}>
                            <i className="material-icons md-2 align-middle mr-2">
                                phone
                            </i>
                            <strong>Voice</strong>
                        </Col>
                        <Col lg={4} className={css.appLink}>
                            {VoiceIntegration && (
                                <Link
                                    to={`/app/settings/integrations/phone/${VoiceIntegration.id}/preferences`}
                                >
                                    Manage Integration
                                </Link>
                            )}
                            {!VoiceIntegration &&
                                hasCapability(
                                    phoneNumber,
                                    IntegrationType.Phone
                                ) && (
                                    <Link
                                        to={`/app/settings/integrations/phone/new?phoneNumberId=${phoneNumber.id}`}
                                    >
                                        <i className="material-icons md-2 align-middle mr-2">
                                            add
                                        </i>
                                        Add Integration
                                    </Link>
                                )}
                        </Col>
                    </Row>
                    {hasCapability(phoneNumber, IntegrationType.Sms) && (
                        <Row
                            className={classnames(
                                css.appRow,
                                'border-bottom',
                                'py-3',
                                'ml-1',
                                'mr-1',
                                {
                                    [css.disabledApp]:
                                        !smsApp ||
                                        !hasCapability(
                                            phoneNumber,
                                            IntegrationType.Sms
                                        ),
                                }
                            )}
                        >
                            <Col lg={8}>
                                <i className="material-icons md-2 align-middle mr-2">
                                    sms
                                </i>
                                <strong>SMS</strong>
                            </Col>
                            <Col lg={4} className={css.appLink}>
                                {smsApp ? (
                                    <Link
                                        to={`/app/settings/integrations/sms/${smsApp.id}/preferences`}
                                    >
                                        Manage Integration
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/app/settings/integrations/sms/new?phoneNumberId=${phoneNumber.id}`}
                                    >
                                        <i className="material-icons md-2 align-middle mr-2">
                                            add
                                        </i>
                                        Add Integration
                                    </Link>
                                )}
                            </Col>
                        </Row>
                    )}
                </Col>
            </Row>
            <Row className="mt-4">
                <Col lg={6} className="mt-4">
                    <Button type="submit" isLoading={isLoading}>
                        Save changes
                    </Button>
                    <ConfirmButton
                        className="float-right"
                        id="delete-number"
                        intent="destructive"
                        confirmationContent={
                            <span>
                                You are about to <strong>delete</strong> this
                                phone number and{' '}
                                <strong>all associated apps</strong>.
                            </span>
                        }
                        onConfirm={handleDelete}
                        isLoading={isDeletePending}
                    >
                        <ButtonIconLabel icon="delete">
                            Delete number
                        </ButtonIconLabel>
                    </ConfirmButton>
                </Col>
            </Row>
        </Form>
    )
}

export default PhoneNumberDetails
