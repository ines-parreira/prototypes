import { useLocation } from 'react-router-dom'

export function useIsAutomateSettings() {
    const location = useLocation()
    return location.pathname.startsWith('/app/settings')
}
