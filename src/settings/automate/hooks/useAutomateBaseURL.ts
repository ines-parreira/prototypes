import { useIsAutomateSettings } from './useIsAutomateSettings'

export function useAutomateBaseURL() {
    const isAutomateSettings = useIsAutomateSettings()
    return isAutomateSettings ? '/app/settings' : '/app/automation'
}
