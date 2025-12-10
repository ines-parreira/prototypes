import { useMutation, useQueryClient } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import { accountConfigurationKeys } from 'models/aiAgent/queries'
import { apiClient } from 'models/aiAgent/resources/configuration'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

interface UpdateAiAutofillParams {
    customFieldId: number
    enabled: boolean
}

const updateAiAutofill = async (
    accountDomain: string,
    { customFieldId, enabled }: UpdateAiAutofillParams,
) => {
    const response = await apiClient.post(
        `/config/accounts/${accountDomain}/custom-fields/${customFieldId}`,
        { enabled },
    )
    return response.data
}

export const useUpdateAiAutofill = () => {
    const queryClient = useQueryClient()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    return useMutation({
        mutationFn: (params: UpdateAiAutofillParams) =>
            updateAiAutofill(accountDomain, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: accountConfigurationKeys.detail(accountDomain),
            })
        },
    })
}
