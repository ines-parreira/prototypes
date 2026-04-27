import { Menu, MenuSection } from '@gorgias/axiom'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-types'

import { useNoticeableWidget } from 'routes/layout/userMenu/useNoticeableWidget'

import { UserMenuAccountSection } from './userMenu/UserMenuAccountSection'
import { UserMenuBetaSection } from './userMenu/UserMenuBetaSection'
import { UserMenuLinksSection } from './userMenu/UserMenuLinksSection'
import { UserMenuStatusSubMenu } from './userMenu/UserMenuStatusSubMenu'
import { UserMenuThemeSubMenu } from './userMenu/UserMenuThemeSubMenu'
import { UserMenuTrigger } from './userMenu/UserMenuTrigger'
import { UserMenuUserHeader } from './userMenu/UserMenuUserHeader'

function UserMenuLoaded({
    currentUser,
}: {
    currentUser: User & { id: number }
}) {
    useNoticeableWidget()

    const userName =
        currentUser.name ?? currentUser.email ?? `Agent #${currentUser.id}`
    const userEmail = currentUser.email
    const userRole = currentUser.role?.name

    return (
        <Menu
            placement="right"
            trigger={
                <UserMenuTrigger
                    userId={currentUser.id}
                    userName={userName}
                    profilePictureUrl={currentUser.meta?.profile_picture_url}
                />
            }
            maxWidth={240}
        >
            <UserMenuUserHeader
                userId={currentUser.id}
                userEmail={userEmail}
                userRole={userRole}
            />
            <MenuSection id="preferences">
                <UserMenuStatusSubMenu userId={currentUser.id} />
                <UserMenuThemeSubMenu />
            </MenuSection>
            <UserMenuBetaSection />
            <UserMenuLinksSection userEmail={userEmail} userRole={userRole} />
            <UserMenuAccountSection userEmail={userEmail} userRole={userRole} />
        </Menu>
    )
}

export function UserMenu() {
    const { data: currentUser } = useGetCurrentUser({
        query: { select: (data: { data: User }) => data.data },
    })

    if (!currentUser?.id) return null

    return <UserMenuLoaded currentUser={currentUser as User & { id: number }} />
}
