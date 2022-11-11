import React, {useMemo, useRef, useCallback, useState} from 'react'
import {useLocalStorage} from 'react-use'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {noop as _noop} from 'lodash'
import classNames from 'classnames'

import {ModalBody} from 'reactstrap'
import * as integrationsSelectors from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {EmailContactInfoDto, HelpCenter} from 'models/helpCenter/types'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import TextArea from 'pages/common/forms/TextArea'

import {
    EMAIL_INTEGRATION_TYPES,
    getIsBaseEmailAddress,
    isGenericEmailIntegration,
} from 'constants/integration'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import Button from 'pages/common/components/button/Button'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {
    CONTACT_FORM_ALERT_ACKNOWLEDGED_LOCAL_STORAGE_KEY,
    HELP_CENTER_DEFAULT_LOCALE,
} from 'pages/settings/helpCenter/constants'
import {FeatureFlagKey} from 'config/featureFlags'
import {getViewLanguage} from 'state/ui/helpCenter'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import Tooltip from 'pages/common/components/Tooltip'
import ContactCard from '../ContactCard'
import helpCenterContactViewCss from '../../HelpCenterContactView.less'

import {MAX_DESCRIPTION_LENGTH} from '../../constants'
import ToggleInput from '../../../../../../common/forms/ToggleInput'
import css from './ContactFormInfoSection.less'

type ContactFormInfoSectionProps = {
    helpCenter: HelpCenter
}

const ContactFormInfoSection = ({helpCenter}: ContactFormInfoSectionProps) => {
    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const {
        translation: {contactInfo},
        updateTranslation,
        updateContactForm,
        contactForm,
    } = useHelpCenterTranslation()

    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    )

    const emailIntegrations = integrations.filter(isGenericEmailIntegration)

    const {description} = contactInfo.email

    const viewLanguage =
        useAppSelector(getViewLanguage) ?? HELP_CENTER_DEFAULT_LOCALE

    const embeddedContactFormUrl = useMemo(() => {
        const domain = getHelpCenterDomain(helpCenter)

        return `${getAbsoluteUrl({domain, locale: viewLanguage})}embed/contact`
    }, [helpCenter, viewLanguage])

    const isEmbeddedContactFormAvailable =
        useFlags()[FeatureFlagKey.HelpCenterEmbeddedContactForm]

    const [isAlertAcknowledged, setIsAlertAcknowledged] = useLocalStorage(
        CONTACT_FORM_ALERT_ACKNOWLEDGED_LOCAL_STORAGE_KEY,
        false
    )

    const isBaseEmailIntegration =
        !!contactForm.helpdesk_integration_email &&
        getIsBaseEmailAddress(contactForm.helpdesk_integration_email)

    const isEmailIntegrationSelected =
        !!helpCenter.contact_form?.helpdesk_integration_email

    const handleChange =
        <TKey extends keyof EmailContactInfoDto>(key: TKey) =>
        (value: EmailContactInfoDto[TKey]) => {
            updateTranslation({
                contactInfo: {
                    ...contactInfo,
                    email: {
                        ...contactInfo.email,
                        [key]: value,
                    },
                },
            })
        }

    const handleInfoClose = () => {
        setIsAlertAcknowledged(true)
    }

    const getTextToCopy = () => {
        const domain = getHelpCenterDomain(helpCenter)
        const absoluteUrl = getAbsoluteUrl({domain})
        return `<script defer type="text/javascript" src="${absoluteUrl}api/contact-form-loader.js?source=${encodeURI(
            embeddedContactFormUrl
        )}"></script>
<link rel="stylesheet" href="${absoluteUrl}api/contact-form-loader.css" />
<div id="gorgias-contact-form-wrapper">
    <div id="gorgias-contact-form-loader"></div>
</div>`
    }

    const onChangeContactFormIntegration = useCallback(
        (integrationId: number | string) => {
            const selectedIntegration = emailIntegrations.find(
                (integration) => integration.id === integrationId
            )

            if (selectedIntegration) {
                updateContactForm({
                    ...contactForm,
                    helpdesk_integration_email:
                        selectedIntegration.meta.address,
                    helpdesk_integration_id: selectedIntegration.id,
                })

                setIsAlertAcknowledged(false)
            }
        },
        [
            emailIntegrations,
            updateContactForm,
            setIsAlertAcknowledged,
            contactForm,
        ]
    )

    const handleGetCodeModal = () => {
        setIsEmbedModalOpen(true)
    }

    const handleCopy = async () => {
        if (!textAreaRef.current) {
            return
        }

        textAreaRef.current.focus()
        textAreaRef.current.select()

        if (!navigator.clipboard) {
            document.execCommand('copy')
        } else {
            await navigator.clipboard.writeText(getTextToCopy())
        }

        setIsCopied(true)
    }

    const handleModalClose = () => {
        setIsEmbedModalOpen(false)
        setIsCopied(false)
    }

    return (
        <>
            <section className={css.container}>
                <div className={helpCenterContactViewCss.leftColumn}>
                    <section className={css.emailSection}>
                        <div className={css.heading}>
                            <div>
                                <h3>Email</h3>
                                <p>
                                    Reply by email when customers get in touch
                                    via contact form.
                                </p>
                            </div>
                        </div>
                    </section>
                    {isBaseEmailIntegration && !isAlertAcknowledged && (
                        <Alert
                            icon
                            type={AlertType.Info}
                            onClose={handleInfoClose}
                            className={css.alert}
                        >
                            Default Gorgias email selected, make sure the
                            desired integration is selected.
                        </Alert>
                    )}
                    {!contactForm.helpdesk_integration_email && (
                        <Alert
                            icon
                            type={AlertType.Error}
                            className={css.alert}
                        >
                            Email integration is required in order to display
                            the Contact Us card.
                        </Alert>
                    )}
                    <label className="control-label" htmlFor="contactForm">
                        Select email integration
                    </label>
                    <SelectField
                        id="contactForm"
                        placeholder="Select an email integration"
                        value={contactForm.helpdesk_integration_id}
                        options={emailIntegrations.map((integration) => ({
                            label:
                                `${integration.name} ` +
                                `<${integration.meta.address}>`,
                            value: integration.id,
                        }))}
                        fullWidth
                        onChange={(integrationId) =>
                            onChangeContactFormIntegration(integrationId)
                        }
                        className={css.selectEmailIntegration}
                        icon="email"
                    />
                    <ToggleInput
                        isToggled={!!contactForm.card_enabled}
                        onClick={(value) => {
                            updateContactForm({
                                ...contactForm,
                                card_enabled: value,
                            })
                        }}
                        isDisabled={!contactForm.helpdesk_integration_email}
                        className={css.contactCardToggle}
                    >
                        Contact form card
                    </ToggleInput>

                    <TextArea
                        label="Card description"
                        value={description}
                        isDisabled={
                            !(
                                contactForm.card_enabled &&
                                contactForm.helpdesk_integration_email
                            )
                        }
                        onChange={(value: string) => {
                            if (value.length > MAX_DESCRIPTION_LENGTH) {
                                setIsDescriptionTooLong(true)
                                return
                            }
                            setIsDescriptionTooLong(false)

                            handleChange('description')(value)
                        }}
                        autoRowHeight
                        rows={1}
                        error={
                            isDescriptionTooLong
                                ? `Description should be no longer than ${MAX_DESCRIPTION_LENGTH} characters`
                                : undefined
                        }
                    />
                    {isEmbeddedContactFormAvailable && (
                        <div
                            className={css.embedWrapper}
                            id="embedded-contact-form"
                        >
                            <h4>Embed contact form</h4>

                            <p>
                                Get the code to embed Gorgias contact form as
                                part of your web site.
                            </p>
                            <div className={css.embedButtons}>
                                <Button
                                    intent="secondary"
                                    className={css.embedButton}
                                    onClick={handleGetCodeModal}
                                    isDisabled={!isEmailIntegrationSelected}
                                >
                                    <i className="material-icons">code</i>Get
                                    Code
                                </Button>
                                <a
                                    className={classNames(css.embedPreview, {
                                        [css.embedPreviewDisabled]:
                                            !isEmailIntegrationSelected,
                                    })}
                                    onClick={() => {
                                        window
                                            .open(
                                                embeddedContactFormUrl,
                                                '_blank'
                                            )!
                                            .focus()
                                    }}
                                >
                                    <i className="material-icons">
                                        open_in_new
                                    </i>
                                    <span>Preview Contact Form</span>
                                </a>
                            </div>
                            {!isEmailIntegrationSelected && (
                                <Tooltip
                                    target="embedded-contact-form"
                                    placement="top-start"
                                    className={css.embedTooltip}
                                    arrowClassName={css.embedTooltipArrow}
                                    autohide={false}
                                >
                                    Select an email integration to enable &
                                    embed your contact form.
                                </Tooltip>
                            )}
                        </div>
                    )}
                </div>
                <ContactCard
                    icon="email"
                    title="Contact us"
                    helpText="Contact us card preview"
                    className={css.card}
                    disabled={
                        !(
                            contactForm.card_enabled &&
                            contactForm.helpdesk_integration_email
                        )
                    }
                >
                    <div>{description}</div>
                </ContactCard>
            </section>
            <Modal
                isOpen={isEmbedModalOpen}
                onClose={handleModalClose}
                classNameContent={css.modalContent}
            >
                <>
                    <ModalHeader title="Embed contact form" />
                    <ModalBody className={css.modalBody}>
                        <div className={css.modalInfo}>
                            Copy the code below and place it into your page's
                            HTML where you want Gorgias contact form to appear.
                        </div>
                        <TextArea
                            onChange={_noop}
                            readOnly
                            ref={textAreaRef}
                            rows={6}
                            value={getTextToCopy()}
                        />
                    </ModalBody>
                    <ModalFooter className={css.modalFooter}>
                        <Button intent="secondary" onClick={handleModalClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleCopy} intent="primary">
                            {!isCopied ? (
                                `Copy Code`
                            ) : (
                                <span className={css.copied}>
                                    <i className="material-icons">check</i>
                                    <span>Copied</span>
                                </span>
                            )}
                        </Button>
                    </ModalFooter>
                </>
            </Modal>
        </>
    )
}

export default ContactFormInfoSection
