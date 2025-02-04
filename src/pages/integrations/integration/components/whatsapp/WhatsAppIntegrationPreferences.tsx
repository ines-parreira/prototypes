import classnames from 'classnames'
import {fromJS} from 'immutable'

import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {Col, Container, Form, FormGroup, Label, Row} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import {
    WhatsAppIntegration,
    isWhatsAppIntegration,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import css from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationPreferences.less'
import {INTEGRATION_REMOVAL_CONFIGURATION_TEXT} from 'pages/integrations/integration/constants'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import settingsCss from 'pages/settings/settings.less'
import {getNewPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'

type Props = {
    integration: WhatsAppIntegration
}

export default function WhatsAppIntegrationPreferences({
    integration,
}: Props): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false)
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState<string | null>(null)
    const phoneNumberId = integration?.meta?.phone_number_id
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const phoneNumber = phoneNumbers[phoneNumberId]
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
        if (!isWhatsAppIntegration(integration) || isInitialized) {
            return
        }
        const {meta} = integration

        setTitle(integration.name)
        setEmoji(meta.emoji ?? null)
        setIsInitialized(true)
    }, [integration, isInitialized])

    if (!isWhatsAppIntegration(integration)) {
        return <div />
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col lg={6} xl={7}>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="title" className="control-label">
                                App title
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
                        <Row className="mt-5 mb-5">
                            <Col>
                                <h4 className="mb-3">Phone number</h4>
                                <Row
                                    className={classnames(
                                        css.appRow,
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
                                            to={`/app/settings/phone-numbers/${integration.meta.phone_number_id}`}
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
                                className="float-right"
                                intent="destructive"
                                isDisabled={!isInitialized}
                                isLoading={isDeleting}
                                onConfirm={handleDelete}
                                confirmationContent={
                                    INTEGRATION_REMOVAL_CONFIGURATION_TEXT
                                }
                                leadingIcon="delete"
                            >
                                Delete integration
                            </ConfirmButton>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}
