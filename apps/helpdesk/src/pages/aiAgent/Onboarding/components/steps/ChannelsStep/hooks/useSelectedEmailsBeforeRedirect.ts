import useLocalStorageWithExpiry from 'hooks/useLocalStorageWithExpiry'

const selectedEmailsBeforeRedirectKey = 'selected-emails-before-redirect'

const expireIn5Minutes = 300 * 1_000

export const useSelectedEmailsBeforeRedirect = () => {
    const { state, setState, remove } = useLocalStorageWithExpiry<number[]>(
        selectedEmailsBeforeRedirectKey,
        expireIn5Minutes,
        [],
    )

    return {
        selectedEmailsBeforeRedirect: state,
        setSelectedEmailsBeforeRedirect: setState,
        clearSelectedEmailsBeforeRedirect: remove,
    }
}
