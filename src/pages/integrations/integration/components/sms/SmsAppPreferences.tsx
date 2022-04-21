import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'
import {Col, Container, Form, FormGroup, Label, Row} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import classnames from 'classnames'

import PageHeader from 'pages/common/components/PageHeader'
import {SmsIntegration, isSmsIntegration} from 'models/integration/types'
import {fetchPhoneNumber} from 'models/phoneNumber/resources'
import {phoneNumberFetched} from 'state/entities/phoneNumbers/actions'
import {getPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import SmsIntegrationBreadcrumbs from 'pages/integrations/integration/components/sms/SmsIntegrationBreadcrumbs'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import settingsCss from 'pages/settings/settings.less'
import useAppSelector from 'hooks/useAppSelector'

import css from './SmsAppPreferences.less'

type Props = {
    integration: SmsIntegration
}

export default function SmsAppPreferences({
    integration,
}: Props): JSX.Element | null {
    const [isInitialized, setIsInitialized] = useState(false)
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState<string | null>(null)
    const phoneNumberId = integration?.meta?.twilio_phone_number_id
    const phoneNumber = useAppSelector(getPhoneNumber(phoneNumberId))

    const dispatch = useAppDispatch()

    const [{loading: isLoading}, handleSubmit] = useAsyncFn(
        async (event: React.FormEvent) => {
            event.preventDefault()
            await dispatch(
                updateOrCreateIntegration(
                    fromJS({
                        id: integration.id,
                        name: title,
                        meta: {
                            emoji,
                            twilio_phone_number_id: phoneNumberId,
                        },
                    })
                )
            )
        },
        [integration, title, emoji, dispatch]
    )

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        await dispatch(deleteIntegration(fromJS(integration)))
    }, [integration, dispatch])

    useEffect(() => {
        if (!isSmsIntegration(integration)) {
            return
        }
        const {meta} = integration

        setTitle(integration.name)
        setEmoji(meta.emoji)
        setIsInitialized(true)
    }, [integration, isInitialized])

    const [, handleFetchPhoneNumber] = useAsyncFn(async (id) => {
        const phoneNumber = await fetchPhoneNumber(id)
        dispatch(phoneNumberFetched(phoneNumber))
    })

    useEffect(() => {
        void handleFetchPhoneNumber(phoneNumberId)
    }, [handleFetchPhoneNumber, phoneNumberId])

    if (!isSmsIntegration(integration)) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader
                title={<SmsIntegrationBreadcrumbs integration={integration} />}
            />

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col lg={6} xl={7}>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Label
                                            htmlFor="title"
                                            className="control-label"
                                        >
                                            Integration title
                                        </Label>
                                        <EmojiTextInput
                                            id="title"
                                            value={title}
                                            emoji={emoji}
                                            placeholder="Ex: Company Support Line"
                                            required
                                            onChange={setTitle}
                                            onEmojiChange={setEmoji}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-5">
                                <Col>
                                    <h4 className="mb-3">Phone number</h4>

                                    <Row
                                        className={classnames(
                                            css.appRow,
                                            'border-bottom',
                                            'ml-1',
                                            'mr-1'
                                        )}
                                    >
                                        <Col lg={8} className="pl-0">
                                            {phoneNumber && (
                                                <PhoneNumberTitle
                                                    phoneNumber={phoneNumber}
                                                />
                                            )}
                                        </Col>
                                        <Col lg={4} className={css.appLink}>
                                            <Link
                                                to={`/app/settings/phone-numbers/${integration.meta.twilio_phone_number_id}`}
                                            >
                                                Manage Phone Number
                                            </Link>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <div className="mt-5">
                                <Button
                                    type="submit"
                                    isDisabled={!isInitialized}
                                    isLoading={isLoading}
                                >
                                    Save changes
                                </Button>
                                <ConfirmButton
                                    id="delete-integration"
                                    className="float-right"
                                    intent="destructive"
                                    isDisabled={!isInitialized}
                                    isLoading={isDeleting}
                                    onConfirm={handleDelete}
                                    confirmationContent="Are you sure you want to delete this integration? All associated views will be disabled."
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete integration
                                    </ButtonIconLabel>
                                </ConfirmButton>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
