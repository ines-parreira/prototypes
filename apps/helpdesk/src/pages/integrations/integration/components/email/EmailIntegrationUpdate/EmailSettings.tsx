import React, { useCallback, useState } from 'react'

import type { EditorState } from 'draft-js'
import type { Map } from 'immutable'
import _capitalize from 'lodash/capitalize'
import { Form, FormGroup } from 'reactstrap'

import {
    LegacyToggleField as ToggleField,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { UploadType } from 'common/types'
import { EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS } from 'constants/integration'
import { IntegrationType } from 'models/integration/constants'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import InputField from 'pages/common/forms/input/InputField'
import RichFieldWithVariables from 'pages/common/forms/RichFieldWithVariables'
import BaseEmailIntegrationInputField from 'pages/integrations/integration/components/email/BaseEmailIntegrationInputField'
import EmailIntegrationDeliverabilitySettings from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationDeliverabilitySettings'
import { displayRestrictedSymbols } from 'utils'
import { convertToHTML } from 'utils/editor'

import css from './EmailIntegrationUpdate.less'

type Props = {
    integration: Map<any, any>
    domain: string
    setSignatureText: (text: string) => void
    setSignatureHtml: (html: string) => void
    name: string
    setName: (name: string) => void
    useGmailCategories: boolean
    setUseGmailCategories: (value: boolean) => void
    enableGmailThreading: boolean
    setEnableGmailThreading: (value: boolean) => void
    enableGmailSending: boolean
    setEnableGmailSending: (value: boolean) => void
    enableOutlookSending: boolean
    setEnableOutlookSending: (value: boolean) => void
}

const EmailSettings = ({
    integration,
    domain,
    name,
    useGmailCategories,
    enableGmailThreading,
    setSignatureText,
    setSignatureHtml,
    setName,
    setUseGmailCategories,
    setEnableGmailThreading,
    setEnableGmailSending,
    setEnableOutlookSending,
}: Props) => {
    const [errors, setErrors] = useState<{ name?: string | null }>({
        name: null,
    })

    const isGmail = integration.get('type') === IntegrationType.Gmail
    const isOutlook = integration.get('type') === IntegrationType.Outlook

    const updateSignature = useCallback(
        (editorState: EditorState) => {
            const contentState = editorState.getCurrentContent()
            const editorText = contentState.getPlainText()
            const editorHtml = convertToHTML(contentState)

            const integrationText =
                integration.getIn(['meta', 'signature', 'text']) || ''
            const htmlIntegration =
                integration.getIn(['meta', 'signature', 'html']) || ''

            if (
                integrationText !== editorText ||
                htmlIntegration !== editorHtml
            ) {
                setSignatureText(editorText)
                setSignatureHtml(editorHtml)
            }
        },
        [setSignatureText, setSignatureHtml, integration],
    )
    const nameHelp = `The display name appears on outgoing emails. It cannot contain the following characters: ${displayRestrictedSymbols(
        EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS as string[],
    )}`
    const outlookDisplayNameLimitationTooltip = (
        <>
            <i
                className="material-icons"
                id="outlook-display-name-limitation-info-icon"
            >
                info_outline
            </i>
            <Tooltip
                target="outlook-display-name-limitation-info-icon"
                autohide={false}
            >
                Display name can only be changed through{' '}
                <a
                    href={
                        'https://learn.microsoft.com/en-us/microsoft-365/admin/add-users/' +
                        'change-a-user-name-and-email-address?view=o365-worldwide' +
                        '#watch-change-a-users-email-address-display-name-or-email-alias'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Outlook
                </a>
            </Tooltip>
        </>
    )

    const setNameMapped = (name: string) => {
        const invalidNameRegexp = new RegExp(
            `[${EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS.join('')}]`,
        )

        if (name && invalidNameRegexp.test(name)) {
            errors.name =
                'The name of your Email integration cannot contain these characters: ' +
                displayRestrictedSymbols(
                    EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS as string[],
                )
        } else {
            errors.name = null
        }

        setName(name)
        setErrors(errors)
    }

    return (
        <>
            <h2 className={css.subTitle}>Email Settings</h2>
            <Accordion>
                <React.Fragment key="1">
                    <AccordionItem>
                        <AccordionHeader>
                            <h3 className="mb-0">Display name and signature</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <Form>
                                <InputField
                                    type="text"
                                    className={css.displayNameField}
                                    name="name"
                                    label={
                                        <div>
                                            Display name {''}
                                            {isOutlook &&
                                                outlookDisplayNameLimitationTooltip}
                                        </div>
                                    }
                                    placeholder={`${_capitalize(domain)} Support`}
                                    isRequired={!isOutlook}
                                    caption={nameHelp}
                                    error={errors?.name ?? ''}
                                    value={name}
                                    onChange={(name) => setNameMapped(name)}
                                    isDisabled={isOutlook}
                                />
                                <FormGroup className={css.textEditor}>
                                    <RichFieldWithVariables
                                        allowExternalChanges
                                        label="Signature"
                                        value={{
                                            text:
                                                integration.getIn([
                                                    'meta',
                                                    'signature',
                                                    'text',
                                                ]) || '',
                                            html:
                                                integration.getIn([
                                                    'meta',
                                                    'signature',
                                                    'html',
                                                ]) || '',
                                        }}
                                        variableTypes={['current_user']}
                                        onChange={updateSignature}
                                        uploadType={UploadType.PublicAttachment}
                                    />
                                </FormGroup>
                            </Form>
                        </AccordionBody>
                    </AccordionItem>
                    {(isGmail || isOutlook) && (
                        <AccordionItem>
                            <AccordionHeader>
                                <h3 className="mb-0">
                                    Advanced delivery settings
                                </h3>
                            </AccordionHeader>
                            <AccordionBody>
                                <Form>
                                    {isGmail && (
                                        <FormGroup
                                            className={css.gmailTogglesWrapper}
                                        >
                                            <ToggleField
                                                caption="Categories include Social, Promotions, Updates and Forums."
                                                label="Tag tickets with Gmail categories"
                                                name="use_gmail_categories"
                                                value={useGmailCategories}
                                                onChange={(value: boolean) =>
                                                    setUseGmailCategories(value)
                                                }
                                            />
                                            <ToggleField
                                                caption="Group emails if they have the same recipients, sender, or subject. "
                                                label="Group emails into conversations"
                                                name="enable_gmail_threading"
                                                value={enableGmailThreading}
                                                onChange={(value: boolean) =>
                                                    setEnableGmailThreading(
                                                        value,
                                                    )
                                                }
                                            />
                                        </FormGroup>
                                    )}
                                    {(isGmail || isOutlook) && (
                                        <FormGroup>
                                            <EmailIntegrationDeliverabilitySettings
                                                integration={integration.toJS()}
                                                onChange={(
                                                    newValue: boolean,
                                                ) => {
                                                    if (isGmail) {
                                                        setEnableGmailSending(
                                                            newValue,
                                                        )
                                                    } else if (isOutlook) {
                                                        setEnableOutlookSending(
                                                            newValue,
                                                        )
                                                    }
                                                }}
                                            />
                                        </FormGroup>
                                    )}
                                </Form>
                            </AccordionBody>
                        </AccordionItem>
                    )}

                    {integration.get('type') === IntegrationType.Email && (
                        <AccordionItem>
                            <AccordionHeader>
                                <h3 className="mb-0">Email forwarding</h3>
                            </AccordionHeader>
                            <AccordionBody>
                                <p>
                                    Configuring email forwarding improves the
                                    deliverability and trustworthiness of your
                                    emails. Route all of your incoming customer
                                    emails from your email provider to your
                                    Gorgias inbox.
                                </p>
                                <h3>Gorgias forwarding address</h3>

                                <BaseEmailIntegrationInputField />
                                <span className={css.secondaryText}>
                                    This Gorgias forwarding address routes
                                    emails from your email provider&apos;s inbox
                                    to Gorgias.
                                </span>
                            </AccordionBody>
                        </AccordionItem>
                    )}
                </React.Fragment>
            </Accordion>
        </>
    )
}

export default EmailSettings
