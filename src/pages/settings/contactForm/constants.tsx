import React from 'react'
import {Language} from 'constants/languages'

export const CONTACT_FORM_EMBEDMENTS_LIMIT = 50

export const CONTACT_FORM_PAGE_TITLE = 'Contact Form'

export const CONTACT_FORM_DEFAULT_LOCALE = Language.EnglishUs

export const CONTACT_FORM_ID_PARAM = 'contactFormId'

export const CONTACT_FORM_BASE_PATH = '/app/settings/contact-form'
export const CONTACT_FORM_SETTINGS_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}`
export const CONTACT_FORM_CUSTOMIZATION_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}/customization`
export const CONTACT_FORM_PUBLISH_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}/publish`
export const CONTACT_FORM_MANAGE_EMBEDMENTS_PATH = `${CONTACT_FORM_PUBLISH_PATH}/embedments`
export const CONTACT_FORM_PREFERENCES_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}/preferences`
export const CONTACT_FORM_ABOUT_PATH = `${CONTACT_FORM_BASE_PATH}/about`
export const CONTACT_FORM_FORMS_PATH = `${CONTACT_FORM_BASE_PATH}/forms`
export const CONTACT_FORM_CREATE_PATH = `${CONTACT_FORM_BASE_PATH}/new`
export const EMAIL_SELECTION_INPUT_LABEL =
    'Select an email to reply to Contact Form submissions'

export const CONTACT_FORM_EMBED_FORM_TEXTS = {
    PageNamePlaceholder: 'ie. Contact Form',
    PageSlugPlaceholder: 'ie. contact-form',
    TooltipText: (
        <>
            You have no existing pages
            <br /> to embed the Contact Form
        </>
    ),
}

export const CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS = {
    workflows: [],
    order_management: {enabled: false},
}
