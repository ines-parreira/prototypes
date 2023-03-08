import {Language} from 'constants/languages'

export const CONTACT_FORM_PAGE_TITLE = 'Contact Form'

export const CONTACT_FORM_DEFAULT_LOCALE = Language.EnglishUs

export const CONTACT_FORM_ID_PARAM = 'contactFormId'

export const CONTACT_FORM_BASE_PATH = '/app/settings/contact-form'
export const CONTACT_FORM_SETTINGS_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}`
export const CONTACT_FORM_APPEARANCE_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}/appearance`
export const CONTACT_FORM_PUBLISH_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}/publish`
export const CONTACT_FORM_PREFERENCES_PATH = `${CONTACT_FORM_BASE_PATH}/:${CONTACT_FORM_ID_PARAM}/preferences`
export const CONTACT_FORM_ABOUT_PATH = `${CONTACT_FORM_BASE_PATH}/about`
export const CONTACT_FORM_FORMS_PATH = `${CONTACT_FORM_BASE_PATH}/forms`
export const CONTACT_FORM_CREATE_PATH = `${CONTACT_FORM_BASE_PATH}/new`
