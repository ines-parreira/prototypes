import type React from 'react'
import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn } from '@repo/hooks'
import { history } from '@repo/routing'
import classnames from 'classnames'
import Clipboard from 'clipboard'
import { Link } from 'react-router-dom'
import {
    Col,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Row,
} from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { countryOptions, PhoneUseCase } from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasApiError } from 'models/api/types'
import { IntegrationType } from 'models/integration/types'
import {
    deleteNewPhoneNumber,
    updateNewPhoneNumber,
} from 'models/phoneNumber/resources'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { PhoneCountry } from 'models/phoneNumber/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import SourceIcon from 'pages/common/components/SourceIcon'
import type { SelectableOption } from 'pages/common/forms/SelectField/types'
import {
    countryCode,
    getAvailableStates,
    hasCapability,
    isNewPhoneNumber,
    isTwilioConnection,
} from 'pages/phoneNumbers/utils'
import {
    newPhoneNumberDeleted,
    newPhoneNumberUpdated,
} from 'state/entities/phoneNumbers/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

import css from './PhoneNumberDetails.less'

type Props = {
    phoneNumber: NewPhoneNumber
}

const countries: SelectableOption[] = countryOptions

export function PhoneNumberDetails({ phoneNumber }: Props) {
    const dispatch = useAppDispatch()
    const isMarketingPhoneNumberEnabled = useFlag(
        FeatureFlagKey.MarketingPhoneNumber,
    )
    const [name, setName] = useState(phoneNumber.name)

    const twilioConnection = phoneNumber.connections.find(isTwilioConnection)

    const numberCountryCode = countryCode(phoneNumber)
    const state =
        !!twilioConnection && numberCountryCode === PhoneCountry.US
            ? getAvailableStates(numberCountryCode).find(
                  (state) => state.code === twilioConnection.meta.address.state,
              )?.name || ''
            : ''
    const [isPhoneNumberCopied, setIsPhoneNumberCopied] = useState(false)
    const countryName = numberCountryCode
        ? (countries.find((c) => c.value === numberCountryCode)?.label ??
          numberCountryCode)
        : ''

    const [{ loading: isDeletePending }, handleDelete] =
        useAsyncFn(async () => {
            try {
                await deleteNewPhoneNumber(phoneNumber.id)
                dispatch(newPhoneNumberDeleted(phoneNumber.id))
                void dispatch(
                    notify({
                        message: 'Successfully deleted phone number',
                        status: NotificationStatus.Success,
                    }),
                )
                history.push('/app/settings/phone-numbers')
            } catch (error) {
                void dispatch(
                    notify({
                        title: (error as GorgiasApiError).response.data.error
                            .msg,
                        message: errorToChildren(error)!,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
            }
        }, [phoneNumber])

    const voiceIntegration = phoneNumber.integrations.find(
        (integration) => integration.type === IntegrationType.Phone,
    )
    const smsIntegration = phoneNumber.integrations.find(
        (integration) => integration.type === IntegrationType.Sms,
    )
    const whatsAppIntegration = phoneNumber.integrations.find(
        (integration) => integration.type === IntegrationType.WhatsApp,
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

    const [{ loading: isLoading }, handleSubmit] = useAsyncFn(
        async (event: React.FormEvent) => {
            event.preventDefault()
            if (!isNewPhoneNumber(phoneNumber)) {
                return
            }

            try {
                const res = await updateNewPhoneNumber({ ...phoneNumber, name })
                if (!res) {
                    return
                }
                dispatch(newPhoneNumberUpdated(res))
                void dispatch(
                    notify({
                        message: 'Successfully updated phone number',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch {
                void dispatch(
                    notify({
                        message: 'Failed to update phone number',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [phoneNumber, name, dispatch],
    )

    if (!isNewPhoneNumber(phoneNumber)) {
        return null
    }

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
                                value={phoneNumber.phone_number_friendly}
                                readOnly
                            />
                            <InputGroupAddon addonType="append">
                                <Button
                                    style={{ height: '100%' }}
                                    className={classnames(
                                        'copy-phone-number-button',
                                        css.copyButton,
                                    )}
                                    data-clipboard-target="#phone-number"
                                    intent="secondary"
                                    leadingIcon="file_copy"
                                >
                                    {isPhoneNumberCopied ? 'Copied!' : 'Copy'}
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                    {isMarketingPhoneNumberEnabled && (
                        <FormGroup>
                            <Label htmlFor="usecase" className="control-label">
                                Use case
                            </Label>
                            <Input
                                id="usecase"
                                value={
                                    phoneNumber.usecase ===
                                    PhoneUseCase.Marketing
                                        ? 'Marketing'
                                        : 'Standard'
                                }
                                readOnly
                            />
                        </FormGroup>
                    )}
                </Col>
            </Row>
            {twilioConnection && (
                <>
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
                                <Input
                                    value={twilioConnection.meta?.type}
                                    readOnly
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        {state && (
                            <Col lg={3} className="pr-lg-0 pr-md-3">
                                <FormGroup>
                                    <Label className="control-label">
                                        State
                                    </Label>
                                    <Input value={state} readOnly />
                                </FormGroup>
                            </Col>
                        )}
                        <Col lg={3} className="pr-lg-0 pr-md-3">
                            <FormGroup>
                                <Label className="control-label">
                                    Area Code
                                </Label>
                                <Input
                                    value={
                                        twilioConnection.meta?.address.area_code
                                    }
                                    readOnly
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </>
            )}
            <Row className="mt-4">
                <Col lg={6} className="pr-lg-0 pr-md-3">
                    <h4 className="mb-3">Connected integrations</h4>
                    {hasCapability(phoneNumber, IntegrationType.Phone) && (
                        <Row
                            className={classnames(css.appRow, 'ml-1', 'mr-1', {
                                [css.disabledApp]:
                                    !voiceIntegration ||
                                    !hasCapability(
                                        phoneNumber,
                                        IntegrationType.Phone,
                                    ),
                            })}
                        >
                            <Col lg={8}>
                                <i className="material-icons md-2 align-middle mr-3">
                                    phone
                                </i>
                                <strong>Voice</strong>
                            </Col>
                            <Col lg={4} className={css.appLink}>
                                {voiceIntegration && (
                                    <Link
                                        to={`/app/settings/channels/phone/${voiceIntegration.id}/preferences`}
                                    >
                                        Manage Integration
                                    </Link>
                                )}
                                {!voiceIntegration &&
                                    hasCapability(
                                        phoneNumber,
                                        IntegrationType.Phone,
                                    ) && (
                                        <Link
                                            to={`/app/settings/channels/phone/new?phoneNumberId=${phoneNumber.id}`}
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
                                        !smsIntegration ||
                                        !hasCapability(
                                            phoneNumber,
                                            IntegrationType.Sms,
                                        ),
                                },
                            )}
                        >
                            <Col lg={8}>
                                <i className="material-icons md-2 align-middle mr-3">
                                    sms
                                </i>
                                <strong>SMS</strong>
                            </Col>
                            <Col lg={4} className={css.appLink}>
                                {smsIntegration ? (
                                    <Link
                                        to={`/app/settings/channels/sms/${smsIntegration.id}/preferences`}
                                    >
                                        Manage Integration
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/app/settings/channels/sms/new?phoneNumberId=${phoneNumber.id}`}
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
                    {hasCapability(phoneNumber, IntegrationType.WhatsApp) && (
                        <Row
                            className={classnames(
                                css.appRow,
                                'border-bottom',
                                'py-3',
                                'ml-1',
                                'mr-1',
                                {
                                    [css.disabledApp]:
                                        !whatsAppIntegration ||
                                        !hasCapability(
                                            phoneNumber,
                                            IntegrationType.WhatsApp,
                                        ),
                                },
                            )}
                        >
                            <Col lg={8}>
                                <SourceIcon
                                    type={IntegrationType.WhatsApp}
                                    className="md-2 align-middle mr-3"
                                />
                                <strong>WhatsApp</strong>
                            </Col>
                            <Col lg={4} className={css.appLink}>
                                {whatsAppIntegration ? (
                                    <Link
                                        to={`/app/settings/integrations/whatsapp/${whatsAppIntegration.id}/preferences`}
                                    >
                                        Manage Integration
                                    </Link>
                                ) : (
                                    <a
                                        href={
                                            window.GORGIAS_STATE.integrations
                                                .authentication.whatsapp
                                                ?.redirect_uri ?? ''
                                        }
                                    >
                                        <i className="material-icons md-2 align-middle mr-2">
                                            add
                                        </i>
                                        Add Integration
                                    </a>
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
                        leadingIcon="delete"
                    >
                        Delete number
                    </ConfirmButton>
                </Col>
            </Row>
        </Form>
    )
}

export default PhoneNumberDetails
