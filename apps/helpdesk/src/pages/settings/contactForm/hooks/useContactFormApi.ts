import { useCallback, useEffect, useState } from 'react'

import { isAxiosError } from 'axios'
import { get } from 'lodash'
import { useHistory } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    ContactForm,
    CreateContactFormDto,
    UpdateContactFormDto,
    UpsertContactFormAutomationSettingsDto,
} from 'models/contactForm/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {
    contactFormDeleted,
    contactFormsFetched,
    contactFormUpdated,
} from 'state/entities/contactForm/contactForms'
import {
    contactFormAutomationSettingsFetched,
    contactFormAutomationSettingsUpdated,
} from 'state/entities/contactForm/contactFormsAutomationSettings'
import { reportError } from 'utils/errors'

import {
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS,
} from '../constants'

export const useContactFormApi = () => {
    const dispatch = useAppDispatch()
    const [pendingCount, setPendingCount] = useState(0)
    const { client } = useHelpCenterApi()
    const history = useHistory()

    useEffect(() => {
        if (!client) return

        const requestInterceptor = client.interceptors.request.use(
            (config) => {
                setPendingCount((prev) => prev + 1)
                return config
            },
            (error) => {
                setPendingCount((prev) => Math.max(prev - 1, 0))
                return Promise.reject(error)
            },
        )

        const responseInterceptor = client.interceptors.response.use(
            (response) => {
                setPendingCount((prev) => Math.max(prev - 1, 0))
                return response
            },
            (error) => {
                setPendingCount((prev) => Math.max(prev - 1, 0))
                return Promise.reject(error)
            },
        )

        return () => {
            client.interceptors.request.eject(requestInterceptor)
            client.interceptors.response.eject(responseInterceptor)
        }
    }, [client])

    // TODO: pagination
    const fetchPaginatedContactForms = useCallback(async (): Promise<{
        items: ContactForm[]
        meta: {
            page: number
            nbPages: number
        }
    }> => {
        if (!client) throw new Error('HTTP client not initialized!')

        try {
            const { data } = await client.listContactForms()
            const contactForms = get(data, 'data') || []

            dispatch(contactFormsFetched(contactForms))

            return {
                meta: {
                    page: get(data, 'meta.page'),
                    nbPages: get(data, 'meta.nb_pages'),
                },
                items: contactForms,
            }
        } catch (error) {
            if (error instanceof Error) {
                reportError(error)
            }
            throw error
        }
    }, [client, dispatch])

    const fetchContactFormById = useCallback(
        async (contactFormId: number): Promise<ContactForm | null> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const { data: contactForm } = await client.getContactForm({
                    id: contactFormId,
                })

                dispatch(contactFormUpdated(contactForm))

                return contactForm
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404) {
                    return null
                }

                if (error instanceof Error) {
                    reportError(error)
                }
                throw error
            }
        },
        [client, dispatch],
    )

    const checkContactFormName = useCallback(
        async (name: string): Promise<boolean> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                await client.checkContactFormNameExists({ input_name: name })
                return false
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404)
                    return true

                if (error instanceof Error) {
                    reportError(error)
                }
                throw error
            }
        },
        [client],
    )

    const createContactForm = useCallback(
        async (
            createContactFormDto: CreateContactFormDto,
        ): Promise<ContactForm> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const { data: contactForm } = await client.createContactForm(
                    null,
                    createContactFormDto,
                )

                dispatch(contactFormUpdated(contactForm))

                return contactForm
            } catch (error) {
                if (error instanceof Error) {
                    reportError(error)
                }
                throw error
            }
        },
        [client, dispatch],
    )

    const updateContactForm = useCallback(
        async (
            contactFormId: number,
            payload: Partial<UpdateContactFormDto>,
        ): Promise<ContactForm> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const { data: updatedContactForm } =
                    await client.updateContactForm(
                        { id: contactFormId },
                        payload,
                    )

                dispatch(contactFormUpdated(updatedContactForm))

                return updatedContactForm
            } catch (error) {
                if (error instanceof Error) {
                    reportError(error)
                }
                throw error
            }
        },
        [client, dispatch],
    )

    const deleteContactForm = useCallback(
        async (contactFormId: number): Promise<boolean> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                await client.deleteContactForm({ id: contactFormId })

                dispatch(contactFormDeleted(contactFormId))

                history.push(CONTACT_FORM_BASE_PATH)
                return true
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404)
                    return true

                if (error instanceof Error) {
                    reportError(error)
                }
                throw error
            }
        },
        [client, dispatch, history],
    )

    const fetchAutomationSettingsByContactFormId = useCallback(
        async (contactFormId: number) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const { data: automationSettings } =
                    await client.getContactFormAutomationSettings({
                        id: contactFormId,
                    })

                dispatch(
                    contactFormAutomationSettingsFetched({
                        contactFormId: contactFormId.toString(),
                        automationSettings,
                    }),
                )
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404) {
                    return dispatch(
                        contactFormAutomationSettingsFetched({
                            contactFormId: contactFormId.toString(),
                            automationSettings:
                                CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS,
                        }),
                    )
                }

                if (error instanceof Error) {
                    reportError(error)
                }
                throw error
            }
        },
        [client, dispatch],
    )

    const upsertAutomationSettingsByContactFormId = useCallback(
        async (
            contactFormId: number,
            payload: UpsertContactFormAutomationSettingsDto,
        ) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const { data: updatedAutomationSettings } =
                    await client.upsertContactFormAutomationSettings(
                        { id: contactFormId },
                        payload,
                    )

                dispatch(
                    contactFormAutomationSettingsUpdated({
                        contactFormId: contactFormId.toString(),
                        automationSettings: updatedAutomationSettings,
                    }),
                )
            } catch (error) {
                if (error instanceof Error) {
                    reportError(error)
                }
                throw error
            }
        },
        [client, dispatch],
    )

    return {
        isReady: !!client,
        isLoading: pendingCount > 0,
        checkContactFormName: checkContactFormName,
        createContactForm: createContactForm,
        deleteContactForm: deleteContactForm,
        fetchContactFormById: fetchContactFormById,
        fetchPaginatedContactForms: fetchPaginatedContactForms,
        updateContactForm: updateContactForm,
        fetchAutomationSettingsByContactFormId,
        upsertAutomationSettingsByContactFormId,
    }
}
