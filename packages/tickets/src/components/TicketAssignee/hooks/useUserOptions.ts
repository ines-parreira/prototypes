import { useMemo, useState } from 'react'

import { useAllUsers, useAllUsersLoadingState } from '@repo/users'
import type { TicketUser, User } from '@gorgias/helpdesk-queries'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import { ListUsersRolesItem } from '@gorgias/helpdesk-types'
import { fuzzySearch } from '@gorgias/toolkit/fuzzy-search'

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
          id: string
          label: string
      }
    | typeof NO_USER_OPTION

export type UserSection = {
    id: string
    name: string
    items: UserOption[]
}

export type UserWithRequiredFields = User & {
    id: NonNullable<User['id']>
    name: NonNullable<User['name']>
}

const ASSIGNABLE_USER_ROLES = new Set<string>([
    ListUsersRolesItem.Admin,
    ListUsersRolesItem.Agent,
    ListUsersRolesItem.BasicAgent,
    ListUsersRolesItem.LiteAgent,
    ListUsersRolesItem.ObserverAgent,
])

const getUserOptionId = (userId: number) => userId.toString()

function hasRequiredUserFields(user: User): user is UserWithRequiredFields {
    return typeof user.id === 'number' && typeof user.name === 'string'
}

function isBotUser(user: User) {
    return user.role?.name === ListUsersRolesItem.Bot
}

function isAssignableUser(user: User): user is UserWithRequiredFields {
    const roleName = user.role?.name
    return (
        hasRequiredUserFields(user) &&
        !isBotUser(user) &&
        typeof roleName === 'string' &&
        ASSIGNABLE_USER_ROLES.has(roleName)
    )
}

type UseUserOptionsParams = {
    currentAssignee?: TicketUser | null
}

export function useUserOptions({ currentAssignee }: UseUserOptionsParams) {
    const [search, setSearch] = useState('')
    const allUsers = useAllUsers()
    const { isLoading } = useAllUsersLoadingState()

    const { data: currentUserData } = useGetCurrentUser()
    const currentUser = currentUserData?.data
    const currentUserId = currentUser?.id

    const users = useMemo(() => {
        const assignableUsers = allUsers.filter(isAssignableUser)

        if (!search) {
            return assignableUsers
        }

        return fuzzySearch(search, assignableUsers, {
            keys: [(user) => user.name, (user) => user.email ?? ''],
        }).map((result) => result.item)
    }, [allUsers, search])

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
                id: getUserOptionId(user.id),
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
                id: getUserOptionId(currentAssignee.id),
                label: currentAssignee.name,
            })
        }
        return options
    }, [otherUsers, currentAssignee, currentUserId, search])

    const usersMap = useMemo(() => {
        const map = new Map(
            otherUsers.map((user) => [getUserOptionId(user.id), user]),
        )
        if (currentUser && hasRequiredUserFields(currentUser)) {
            map.set(getUserOptionId(currentUser.id), currentUser)
        }
        if (currentAssignee?.id && currentAssignee.name) {
            map.set(
                getUserOptionId(currentAssignee.id),
                currentAssignee as UserWithRequiredFields,
            )
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
                        id: getUserOptionId(currentUserId),
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
                (option) => option.id === getUserOptionId(currentAssignee.id),
            )

        if (shouldShowSelectedAssigneeSection) {
            sections.push({
                ...SECTION_DETAILS.SELECTED,
                items: [
                    {
                        id: getUserOptionId(currentAssignee.id),
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
            userOptions.find(
                (option) => option.id === getUserOptionId(currentAssignee.id),
            ) ?? {
                id: getUserOptionId(currentAssignee.id),
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
    }
}
