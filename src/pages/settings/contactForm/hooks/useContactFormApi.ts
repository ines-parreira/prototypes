import {useCallback, useState, useEffect} from 'react'
import axios from 'axios'
import {get} from 'lodash'
import {
    ContactForm,
    CreateContactFormDto,
    UpdateContactFormDto,
} from 'models/contactForm/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    contactFormsFetched,
    contactFormDeleted,
    contactFormUpdated,
} from 'state/entities/contactForm/contactForms'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {reportError} from 'utils/errors'

export const useContactFormApi = () => {
    const dispatch = useAppDispatch()
    const [pendingCount, setPendingCount] = useState(0)
    const {client} = useHelpCenterApi()

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
            }
        )

        const responseInterceptor = client.interceptors.response.use(
            (response) => {
                setPendingCount((prev) => Math.max(prev - 1, 0))
                return response
            },
            (error) => {
                setPendingCount((prev) => Math.max(prev - 1, 0))
                return Promise.reject(error)
            }
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
            const {data} = await client.get(`/api/help-center/contact-forms`)
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
            reportError(error)
            throw error
        }
    }, [client, dispatch])

    const fetchContactFormById = useCallback(
        async (contactFormId: number): Promise<ContactForm | null> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const {data: contactForm} = await client.get(
                    `/api/help-center/contact-forms/${contactFormId}`
                )

                dispatch(contactFormUpdated(contactForm))

                return contactForm as ContactForm
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    return null
                }

                reportError(error)
                throw error
            }
        },
        [client, dispatch]
    )

    const checkContactFormName = useCallback(
        async (name: string): Promise<boolean> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                await client.head(`/api/help-center/contact-forms/name/${name}`)
                return false
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404)
                    return true

                reportError(error as Error)
                throw error
            }
        },
        [client]
    )

    const createContactForm = useCallback(
        async (
            createContactFormDto: CreateContactFormDto
        ): Promise<ContactForm> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const {data: contactForm} = await client.post(
                    `/api/help-center/contact-forms`,
                    createContactFormDto
                )

                dispatch(contactFormUpdated(contactForm))

                return contactForm as ContactForm
            } catch (error) {
                reportError(error as Error)
                throw error
            }
        },
        [client, dispatch]
    )

    const updateContactForm = useCallback(
        async (
            contactFormId: number,
            payload: Partial<UpdateContactFormDto>
        ): Promise<ContactForm> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                const {data: updatedContactForm} = await client.put(
                    `/api/help-center/contact-forms/${contactFormId}`,
                    payload
                )

                dispatch(contactFormUpdated(updatedContactForm))

                return updatedContactForm as ContactForm
            } catch (error) {
                reportError(error as Error)
                throw error
            }
        },
        [client, dispatch]
    )

    const deleteContactForm = useCallback(
        async (contactFormId: number): Promise<boolean> => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                await client.delete(
                    `/api/help-center/contact-forms/${contactFormId}`
                )

                dispatch(contactFormDeleted(contactFormId))

                return true
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404)
                    return true

                reportError(error as Error)
                throw error
            }
        },
        [client, dispatch]
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
    }
}
