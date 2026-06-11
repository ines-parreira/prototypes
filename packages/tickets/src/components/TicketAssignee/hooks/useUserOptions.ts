import { useMemo } from 'react'

import type { TicketUser } from '@gorgias/helpdesk-queries'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import type { NonNullableUser } from './useListUsersSearch'
import { useListUsersSearch } from './useListUsersSearch'

const SECTION_DETAILS = {
    SELECTED: {
        id: 'selected',
        name: '',
    },
    SELF: {
        id: 'self',
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

    const otherUsersOptions = useMemo(() => {
        let isCurrentAssigneeLoaded = false
        const options = otherUsers.map((user) => {
            if (user.id === currentAssignee?.id) {
                isCurrentAssigneeLoaded = true
            }
            return {
                id: user.id,
                label: user.name,
            }
        })

        const shouldPreserveSelectedAssigneeOption =
            currentAssignee &&
            !isCurrentAssigneeLoaded &&
            currentAssignee.id !== currentUserId &&
            !search

        if (shouldPreserveSelectedAssigneeOption) {
            options.push({
                id: currentAssignee?.id,
                label: currentAssignee?.name,
            })
        }
        return options
    }, [otherUsers, currentAssignee, currentUserId, search])

    const usersMap = useMemo(() => {
        const map = new Map(otherUsers.map((user) => [user.id, user]))
        if (currentUser && !!currentUser.id && !!currentUser.name) {
            map.set(currentUser.id, currentUser as NonNullableUser)
        }
        if (currentAssignee?.id && currentAssignee.name) {
            map.set(currentAssignee.id, currentAssignee as NonNullableUser)
        }
        return map
    }, [otherUsers, currentUser, currentAssignee])

    const userSections = useMemo<UserSection[]>(() => {
        const sections: UserSection[] = []
        const isCurrentUserAssigned = currentAssignee?.id === currentUserId

        if (currentUserId && !search) {
            sections.push({
                ...SECTION_DETAILS.SELF,
                items: [
                    {
                        id: currentUserId,
                        label: 'Assign yourself',
                    },
                ],
            })
        }

        const shouldShowSelectedAssigneeSection =
            currentAssignee &&
            search &&
            !isCurrentUserAssigned &&
            !otherUsersOptions.some(
                (option) => option.id === currentAssignee.id,
            )

        if (shouldShowSelectedAssigneeSection) {
            sections.push({
                ...SECTION_DETAILS.SELECTED,
                items: [
                    {
                        id: currentAssignee.id,
                        label: currentAssignee.name,
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

    const selectedOption = useMemo<UserOption | undefined>(() => {
        if (currentAssignee === undefined) {
            return undefined
        }

        if (currentAssignee === null) {
            return NO_USER_OPTION
        }
        return (
            userOptions.find((option) => option.id === currentAssignee.id) ?? {
                id: currentAssignee.id,
                label:
                    currentAssignee.id === currentUserId
                        ? 'Assign yourself'
                        : currentAssignee.name,
            }
        )
    }, [currentAssignee, currentUserId, userOptions])

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
