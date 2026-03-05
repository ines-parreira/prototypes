import type { IconName } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'
import type { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

import css from './Section.less'

const Section = ({
    children,
    id,
    requiredRole,
    value,
    icon,
}: {
    children: React.ReactNode
    id: string
    requiredRole?: UserRole
    value: string
    icon?: IconName
}) => {
    const currentUser = useAppSelector(getCurrentUser)

    if (!!requiredRole && !hasRole(currentUser, requiredRole)) {
        return null
    }

    return (
        <Navigation.Section
            data-candu-id={`settings-category-${id}`}
            value={value}
            icon={icon}
        >
            <Navigation.SectionTrigger icon={icon}>
                <div className={css.title}>{value}</div>
                <Navigation.SectionIndicator />
            </Navigation.SectionTrigger>
            {children}
        </Navigation.Section>
    )
}

export default Section
