import React, { useState } from 'react'

import { isAxiosError } from 'axios'
import classNames from 'classnames'
import { get } from 'lodash'
import { useHistory } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import type {
    ContactFormIntegration,
    UpdateContactFormDto,
} from 'models/contactForm/types'
import type { LocaleCode } from 'models/helpCenter/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { ConnectContactFormToShopSection } from 'pages/settings/contactForm/components/ConnectContactFormToShopSection/ConnectContactFormToShopSection'
import ContactFormNameInputSection from 'pages/settings/contactForm/components/ContactFormNameInputSection'
import EmailIntegrationInputSection from 'pages/settings/contactForm/components/EmailIntegrationInputSection'
import LanguageInputSection from 'pages/settings/contactForm/components/LanguageInputSection'
import {
    CONTACT_FORM_BASE_PATH,
    EMAIL_SELECTION_INPUT_LABEL,
} from 'pages/settings/contactForm/constants'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import { useContactFormApi } from 'pages/settings/contactForm/hooks/useContactFormApi'
import { useCurrentContactForm } from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import { useDefaultEmailSelectedBanner } from 'pages/settings/contactForm/hooks/useDefaultEmailSelectedBanner'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import usePreferencesStoreMapping from 'pages/settings/contactForm/hooks/usePreferencesStoreMapping'
import { catchAsync } from 'pages/settings/contactForm/utils/errorHandling'
import css from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPreferences/ContactFormPreferences.less'
import PendingChangesModal from 'pages/settings/helpCenter/components/PendingChangesModal'
import settingsCss from 'pages/settings/settings.less'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const ContactFormPreferences = (): JSX.Element => {
    const {
        isReady,
        checkContactFormName,
        updateContactForm,
        isLoading,
        deleteContactForm,
    } = useContactFormApi()
    const history = useHistory()
    const dispatch = useAppDispatch()
    const contactForm = useCurrentContactForm()
    const [isNameInvalid, setIsNameInvalid] = useState(false)
    const [isDeletionModalShown, setIsDeletionModalShown] = useState(false)
    const [isChangesModalShown, setIsChangesModalShown] = useState(false)
    const [updateContactFormDto, setUpdateContactFormDto] = useState<
        Pick<
            UpdateContactFormDto,
            | 'name'
            | 'email_integration'
            | 'default_locale'
            | 'shop_integration_id'
        >
    >({})

    const { handleStoreMappingCreation } = usePreferencesStoreMapping({
        contactForm,
    })

    const { hasAccess } = useAiAgentAccess(contactForm?.shop_name || undefined)

    const onConnectedShopChange = ({
        shop_name,
        shop_integration_id,
    }: {
        shop_name: string | null
        shop_integration_id: number | null
    }) => {
        setUpdateContactFormDto((prev) => ({
            ...prev,
            shop_name,
            shop_integration_id,
        }))
    }

    const onChangeName = (name: string) => {
        setUpdateContactFormDto((prev) => ({
            ...prev,
            name: name !== contactForm.name ? name : undefined,
        }))
    }

    const onChangeEmailIntegration = (integration: ContactFormIntegration) => {
        resetAcknowledgement()
        setUpdateContactFormDto((prev) => ({
            ...prev,
            email_integration: {
                id: integration.id,
                email: integration.meta.address,
            },
        }))
    }

    const onChangeLocale = (locale: LocaleCode) => {
        setUpdateContactFormDto((prev) => ({
            ...prev,
            default_locale: locale,
        }))
    }

    const discardChanges = () => {
        setUpdateContactFormDto({})
        setIsChangesModalShown(false)
    }

    const onSave = async () => {
        const [error, result] = await catchAsync(async () => {
            await handleStoreMappingCreation(updateContactFormDto)
            return updateContactForm(contactForm.id, updateContactFormDto)
        })

        const isUpdated = !error && result

        dispatch(
            notifyAction({
                status: isUpdated
                    ? NotificationStatus.Success
                    : NotificationStatus.Error,
                message: isUpdated
                    ? 'Contact form updated successfully'
                    : 'Failed to update the Contact Form',
            }),
        )

        if (isUpdated) {
            setIsChangesModalShown(false)
            setUpdateContactFormDto({})
        }
    }

    const onDelete = async () => {
        const [error, result] = await catchAsync(() =>
            deleteContactForm(contactForm.id),
        )

        const isDeleted = !error && result

        const errorMessage =
            (isAxiosError(error) &&
                get(error, 'response.status') === 400 &&
                get(error, 'response.data.message')) ||
            'Failed to delete the Contact Form'

        setIsDeletionModalShown(false)
        dispatch(
            notifyAction({
                status: isDeleted
                    ? NotificationStatus.Success
                    : NotificationStatus.Error,
                message: isDeleted
                    ? 'Contact form deleted successfully'
                    : errorMessage,
            }),
        )

        if (isDeleted) history.push(CONTACT_FORM_BASE_PATH)
    }

    const isDirty =
        Object.keys(updateContactFormDto).length > 0 &&
        (updateContactFormDto.name !== contactForm.name ||
            updateContactFormDto.default_locale !==
                contactForm.default_locale ||
            updateContactFormDto.email_integration?.id !==
                contactForm.email_integration?.id)

    const isSaveChangesEnabled =
        ((updateContactFormDto.name && updateContactFormDto.name.length > 1) ||
            updateContactFormDto.email_integration ||
            updateContactFormDto.default_locale ||
            updateContactFormDto.shop_integration_id !== undefined) &&
        !isNameInvalid &&
        !isLoading &&
        isDirty

    const { defaultIntegration } = useEmailIntegrations()
    const isDefaultIntegrationSelected =
        (
            updateContactFormDto?.email_integration ||
            contactForm.email_integration
        )?.id === defaultIntegration?.id

    const { BannerComponent, resetAcknowledgement } =
        useDefaultEmailSelectedBanner({ isDefaultIntegrationSelected })

    return (
        <div className={settingsCss.pageContainer}>
            <PendingChangesModal
                when={isDirty}
                show={isChangesModalShown}
                onSave={onSave}
                onDiscard={() => setIsChangesModalShown(false)}
                onContinueEditing={() => setIsChangesModalShown(false)}
            />
            <Modal
                size="small"
                isOpen={isDeletionModalShown}
                onClose={() => setIsDeletionModalShown(false)}
            >
                <ModalHeader title="Delete contact form?" />
                <ModalBody>
                    <p>
                        If you delete this form, it will no longer load properly
                        on pages where it’s embedded on your website.
                    </p>
                    <Button intent="destructive" onClick={onDelete}>
                        Delete Form
                    </Button>
                    <Button
                        onClick={() => setIsDeletionModalShown(false)}
                        className={contactFormCss.mlXs}
                        intent="secondary"
                    >
                        Cancel
                    </Button>
                </ModalBody>
            </Modal>

            <div className={settingsCss.contentWrapper}>
                <section className={contactFormCss.mbM}>
                    <h2
                        className={classNames(
                            contactFormCss.sectionTitle,
                            contactFormCss.mbXxs,
                        )}
                    >
                        Preferences
                    </h2>
                    <p>
                        Manage the name, email, language, and store associated
                        with your form.
                    </p>
                </section>

                <section className={contactFormCss.mbL}>
                    <ContactFormNameInputSection
                        isNameCheckEnabled={
                            !!updateContactFormDto.name &&
                            updateContactFormDto.name !== contactForm.name
                        }
                        setIsNameInvalid={setIsNameInvalid}
                        onChange={onChangeName}
                        contactFormName={
                            updateContactFormDto.name ?? contactForm.name
                        }
                        checkContactFormName={checkContactFormName}
                        isApiReady={isReady}
                    />
                </section>

                {BannerComponent && (
                    <section className={contactFormCss.mbL}>
                        {BannerComponent}
                    </section>
                )}

                <section className={contactFormCss.mbL}>
                    <EmailIntegrationInputSection
                        onChange={onChangeEmailIntegration}
                        emailIntegrationId={
                            updateContactFormDto.email_integration?.id ||
                            contactForm.email_integration?.id
                        }
                        customLabel={EMAIL_SELECTION_INPUT_LABEL}
                    />
                </section>

                <section className={contactFormCss.mbL}>
                    <LanguageInputSection
                        onChange={onChangeLocale}
                        locale={
                            updateContactFormDto.default_locale ||
                            contactForm.default_locale
                        }
                    />
                </section>

                {hasAccess && (
                    <ConnectContactFormToShopSection
                        onUpdate={onConnectedShopChange}
                        shopName={
                            contactForm.shop_integration?.shop_name ?? null
                        }
                        shopIntegrationId={
                            contactForm.shop_integration?.integration_id ?? null
                        }
                    />
                )}

                <div
                    className={classNames(
                        contactFormCss.mtXl,
                        css.bottomButtons,
                    )}
                >
                    <div>
                        <Button
                            isDisabled={!isSaveChangesEnabled}
                            onClick={onSave}
                        >
                            Save Changes
                        </Button>
                        <Button
                            onClick={discardChanges}
                            className={contactFormCss.mlXs}
                            intent="secondary"
                        >
                            Cancel
                        </Button>
                    </div>
                    <Button
                        intent="destructive"
                        fillStyle="ghost"
                        onClick={() => setIsDeletionModalShown(true)}
                        leadingIcon="delete"
                    >
                        Delete Form
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ContactFormPreferences
