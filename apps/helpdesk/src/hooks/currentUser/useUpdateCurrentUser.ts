import { useUpdateUser } from '@gorgias/helpdesk-queries'

export const useUpdateCurrentUser = (
    options?: Parameters<typeof useUpdateUser>[0],
) => {
    const {
        mutate: updateCurrentUser,
        mutateAsync: updateCurrentUserAsync,
        ...rest
    } = useUpdateUser(options)

    /**
     * This hook is used to update the current user. This is done by setting the id to 0,
     * which is used as a placeholder for the current user.
     */
    return {
        mutate: (data: Parameters<typeof updateCurrentUser>[0]['data']) =>
            updateCurrentUser({
                id: 0,
                data,
            }),
        mutateAsync: (
            data: Parameters<typeof updateCurrentUserAsync>[0]['data'],
        ) => updateCurrentUserAsync({ id: 0, data }),
        ...rest,
    }
}
