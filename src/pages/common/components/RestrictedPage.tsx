import React, {useMemo} from 'react'
import indefinite from 'indefinite'
import _startCase from 'lodash/startCase'

import {RoleLabel} from 'pages/common/utils/labels'
import {UserRole} from 'config/types/user'
import {roleRestrictionConfigs} from 'config/roleRestrictions'
import {USER_ROLES_ORDERED_BY_PRIVILEGES} from 'config/user'
import {PageSection} from 'config/pages'
import PageHeader from './PageHeader'

import css from './RestrictedPage.less'

type Props = {
    requiredRole: UserRole
    page?: PageSection
}

const RestrictedPage = ({requiredRole, page}: Props) => {
    const role = useMemo(() => {
        const roleIndex = USER_ROLES_ORDERED_BY_PRIVILEGES.findIndex(
            (role) => role === requiredRole
        )
        const requiredRoles = USER_ROLES_ORDERED_BY_PRIVILEGES.slice(
            roleIndex
        ).map((role) =>
            role === UserRole.Agent ? 'Lead Agent' : _startCase(role)
        )

        return requiredRoles.reduce((acc: string, role: string, index) => {
            return acc.concat(
                index === 0
                    ? role
                    : index === requiredRoles.length - 1
                    ? ` or ${role}`
                    : `, ${role}`
            )
        }, '')
    }, [requiredRole])

    const config = useMemo(
        () => (page ? roleRestrictionConfigs[page] : undefined),
        [page]
    )

    return (
        <div className="full-width">
            {!!config?.pageHeader && <PageHeader title={config.pageHeader} />}
            <div className={css.content}>
                <div className={css.badge}>
                    <RoleLabel role={{name: requiredRole}} />
                </div>
                <h2 className={css.heading}>Restricted access</h2>
                <p className={css.description}>
                    To be able to see {config?.pageHeader || 'this page'} you
                    need to be {indefinite(role, {articleOnly: true})}{' '}
                    <b>{role}</b>.
                </p>
                <a
                    href="https://docs.gorgias.com/user/adding-team-members#user_permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={css.link}
                >
                    See all permissions
                </a>
            </div>
        </div>
    )
}

export default RestrictedPage
