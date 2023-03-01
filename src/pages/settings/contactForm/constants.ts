import {Language} from 'constants/languages'

export const CONTACT_FORM_PAGE_TITLE = 'Contact Form'

export const CONTACT_FORM_DEFAULT_LOCALE = Language.EnglishUs

export const CONTACT_FORM_ABOUT_ROUTE = '/about'
export const CONTACT_FORM_FORMS_ROUTE = '/forms'
export const CONTACT_FORM_CREATE_ROUTE = '/new'
export const CONTACT_FORM_SETTINGS_ROUTE = '/:contactFormId'
export const CONTACT_FORM_BASE_PATH = '/app/settings/contact-form'
export const CONTACT_FORM_SETTINGS_PATH = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_SETTINGS_ROUTE}`
export const CONTACT_FORM_ABOUT_PATH = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_ABOUT_ROUTE}`
export const CONTACT_FORM_FORMS_PATH = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_FORMS_ROUTE}`
export const CONTACT_FORM_CREATE_PATH = `${CONTACT_FORM_BASE_PATH}${CONTACT_FORM_CREATE_ROUTE}`
