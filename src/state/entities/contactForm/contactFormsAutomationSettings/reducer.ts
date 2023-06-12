import {createReducer} from '@reduxjs/toolkit'
import {
    contactFormAutomationSettingsFetched,
    contactFormAutomationSettingsUpdated,
} from 'state/entities/contactForm/contactFormsAutomationSettings/actions'
import {ContactFormsAutomationSettingsState} from './types'

export const initialState: ContactFormsAutomationSettingsState = {
    automationSettingsByContactFormId: {},
}

const contactFormAutomationSettingsReducer =
    createReducer<ContactFormsAutomationSettingsState>(
        initialState,
        (builder) =>
            builder
                .addCase(
                    contactFormAutomationSettingsFetched,
                    (state, {payload: {contactFormId, automationSettings}}) => {
                        state.automationSettingsByContactFormId[contactFormId] =
                            automationSettings
                    }
                )
                .addCase(
                    contactFormAutomationSettingsUpdated,
                    (state, {payload: {contactFormId, automationSettings}}) => {
                        state.automationSettingsByContactFormId[contactFormId] =
                            automationSettings
                    }
                )
    )

export default contactFormAutomationSettingsReducer
