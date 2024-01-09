import {useCallback, useEffect, useMemo, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useQueryClient} from '@tanstack/react-query'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {isGorgiasApiError} from 'models/api/types'
import {Components} from 'rest_api/help_center_api/client.generated'
import {useEmailIntegrations} from '../../hooks/useEmailIntegrations'
import {
    contactFormMailtoReplacementConfigKeys,
    useGetContactFormMailtoReplacementConfig,
    useUpsertContactFormMailtoReplacementConfig,
} from './queries'
import {sortEmailByDomainAndName} from './utils'

type MailtoReplacementConfigGetDto =
    Components.Schemas.MailtoReplacementConfigGetDto

// This is contract with the server where we can know what happened on the server by status code.
// This is needed because by technical requirement we have 1 endpoint for update/create/delete
const MESSAGE_BY_STATUS_CODE: Record<number, string> = {
    200: 'Replaced with link to Contact Form.', // updated
    201: 'Replaced with link to Contact Form.', // created
    204: 'Reverted to original email links.', // deleted
}

export const useContactFormMailtoReplacementConfig = ({
    contactFormId,
}: {
    contactFormId: number
}) => {
    const dispatch = useDispatch()
    const {emailIntegrations} = useEmailIntegrations()

    const queryClient = useQueryClient()

    const emailsFromEmailIntegrations = useMemo(
        () =>
            emailIntegrations
                .map((emailIntegration) => emailIntegration.meta.address)
                .sort(sortEmailByDomainAndName),
        [emailIntegrations]
    )
    const [emailList, setEmailList] = useState<string[]>(
        emailsFromEmailIntegrations
    )

    const {data: mailtoReplacementConfig, isLoading} =
        useGetContactFormMailtoReplacementConfig(contactFormId)

    const queryKey = contactFormMailtoReplacementConfigKeys.get(contactFormId)

    /*
     * Here is optimistic update suggested by react query.
     * We use `get` function to get the entity and update it every time we call `mutation`.
     * If request failed we fallback to the state we have before we call `mutation` function.
     * cf. https://tanstack.com/query/v4/docs/react/guides/optimistic-updates
     * */
    const {mutate: upsertMailtoReplacementConfigMutate, isSuccess} =
        useUpsertContactFormMailtoReplacementConfig<{
            previousMailtoReplacementConfig:
                | MailtoReplacementConfigGetDto
                | undefined
        }>({
            onMutate: async ([, , newMailtoReplacementConfig]) => {
                // Cancel any outgoing refetches
                // (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries({
                    queryKey,
                })

                const previousMailtoReplacementConfig =
                    queryClient.getQueryData<MailtoReplacementConfigGetDto>(
                        queryKey
                    )

                // Optimistically update to the new value
                queryClient.setQueryData(queryKey, {
                    ...newMailtoReplacementConfig,
                })

                // Return a context with the previous data
                return {
                    previousMailtoReplacementConfig,
                }
            },
            // If the mutation fails, use the context we returned above
            onError: (error, _, context) => {
                dispatch(
                    notify({
                        title: isGorgiasApiError(error)
                            ? error.response?.data.error.msg
                            : `Whoops, something went wrong during ${contactFormId} mailto replacement config update`,
                        status: NotificationStatus.Error,
                    })
                )
                queryClient.setQueryData(
                    queryKey,
                    // null is needed to update the state when creation of config failed. setQueryData doesn't update the state if we pass undefined
                    context?.previousMailtoReplacementConfig ?? null
                )
            },
            onSuccess: (data) => {
                const statusCode = data?.statusCode ?? 200
                const messageByStatusCode =
                    MESSAGE_BY_STATUS_CODE[statusCode] ??
                    MESSAGE_BY_STATUS_CODE[200]

                dispatch(
                    notify({
                        message: messageByStatusCode,
                        status: NotificationStatus.Success,
                    })
                )
            },
        })

    useEffect(() => {
        setEmailList(
            emailsFromEmailIntegrations.filter(
                (selectedEmail) =>
                    !mailtoReplacementConfig?.emails.includes(selectedEmail)
            )
        )
    }, [emailsFromEmailIntegrations, mailtoReplacementConfig, isSuccess])

    const upsertMailtoReplacementConfig = useCallback(
        (emails: string[]) => {
            upsertMailtoReplacementConfigMutate([
                undefined,
                {contact_form_id: contactFormId},
                {...mailtoReplacementConfig, emails},
            ])
        },
        [
            contactFormId,
            mailtoReplacementConfig,
            upsertMailtoReplacementConfigMutate,
        ]
    )

    return {
        emailList,
        mailtoReplacementConfig,
        upsertMailtoReplacementConfig,
        isLoading,
    }
}
