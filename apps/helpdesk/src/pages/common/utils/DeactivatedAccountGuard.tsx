import { Redirect } from 'react-router-dom'

import { useIsAccountDeactivated } from 'hooks/useIsAccountDeactivated'

/**
 * A guard component that checks if the current account is deactivated and prevents access
 * to protected pages by redirecting deactivated accounts to the /app/views route.
 *
 * This component wraps other components/pages that should only be accessible to active accounts.
 * If the account is deactivated (has a truthy deactivated_datetime value), it will redirect
 * the user to /app/views instead of rendering the children components.
 *
 * @param children - The React components/pages to render if the account is active
 * @returns JSX element - Either a Redirect to /app/views or the children components
 *
 * @example
 * ```tsx
 * <DeactivatedAccountGuard>
 *   <ProtectedPage />
 * </DeactivatedAccountGuard>
 * ```
 */
export function DeactivatedAccountGuard({
    children,
}: {
    children: React.ReactNode
}) {
    const isAccountDeactivated = useIsAccountDeactivated()

    if (isAccountDeactivated) {
        return <Redirect to="/app/views" />
    }

    return children
}
