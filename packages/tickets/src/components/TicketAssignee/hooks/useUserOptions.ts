import { useMemo } from 'react'

import { TicketUser, useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { NonNullableUser, useListUsersSearch } from './useListUsersSearch'

const SECTION_DETAILS = {
    SELF: {
        id: 'you',
        name: '',
    },
    OTHERS: {
        id: 'others',
        name: 'Assign to others',
    },
    UNASSIGNED: {
        id: 'unassigned',
        name: '',
    },
}

export const NO_USER_OPTION = {
    id: 'no_user',
    label: 'Unassigned',
} as const

export type UserOption =
    | {
          id: number
          label: string
      }
    | typeof NO_USER_OPTION

export type UserSection = {
    id: string
    name: string
    items: UserOption[]
}

type UseUserOptionsParams = {
    currentAssignee?: TicketUser | null
}

export function useUserOptions({ currentAssignee }: UseUserOptionsParams) {
    const { users, isLoading, search, setSearch, onLoad, shouldLoadMore } =
        useListUsersSearch()

    const { data: currentUserData } = useGetCurrentUser()
    const currentUser = currentUserData?.data
    const currentUserId = currentUser?.id

    const otherUsers = useMemo(
        () =>
            currentUserId
                ? users.filter((user) => user.id !== currentUserId)
                : users,
        [users, currentUserId],
    )

    const otherUsersOptions = useMemo(
        () =>
            otherUsers.map((user) => ({
                id: user.id,
                label: user.name,
            })),
        [otherUsers],
    )

    const usersMap = useMemo(() => {
        const map = new Map(otherUsers.map((user) => [user.id, user]))
        if (currentUser && !!currentUser.id && !!currentUser.name) {
            map.set(currentUser.id, currentUser as NonNullableUser)
        }
        return map
    }, [otherUsers, currentUser])

    const userSections = useMemo<UserSection[]>(() => {
        const sections: UserSection[] = []

        if (currentUserId && !search) {
            sections.push({
                ...SECTION_DETAILS.SELF,
                items: [
                    {
                        id: currentUserId,
                        label: 'You',
                    },
                ],
            })
        }

        if (otherUsersOptions.length > 0) {
            sections.push({
                ...SECTION_DETAILS.OTHERS,
                items: otherUsersOptions,
            })
        }

        if (currentAssignee && !isLoading && !search && sections.length > 0) {
            sections.unshift({
                ...SECTION_DETAILS.UNASSIGNED,
                items: [NO_USER_OPTION],
            })
        }

        return sections
    }, [currentAssignee, currentUserId, isLoading, search, otherUsersOptions])

    const userOptions = useMemo<UserOption[]>(() => {
        return userSections.flatMap((section) => section.items)
    }, [userSections])

    const selectedOption = useMemo(() => {
        if (!currentAssignee) {
            return NO_USER_OPTION
        }
        return userOptions.find((option) => option.id === currentAssignee.id)
    }, [currentAssignee, userOptions])

    return {
        usersMap,
        userSections,
        selectedOption,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    }
}
