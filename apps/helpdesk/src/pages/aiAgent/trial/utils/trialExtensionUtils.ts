import moment from 'moment'

const TRIAL_EXTENSION_REQUESTED_KEY =
    'ai-agent-trial-extension-requested-timestamp'

export const COOLDOWN_WAIT_HOURS = 24

const getLastRequestTimestamp = (): number | null => {
    const stored = localStorage.getItem(TRIAL_EXTENSION_REQUESTED_KEY)
    if (!stored) {
        return null
    }

    const parsed = parseInt(stored, 10)
    return isNaN(parsed) ? null : parsed
}

export const canRequestTrialExtension = (): boolean => {
    const lastRequestTimestamp = getLastRequestTimestamp()
    return (
        lastRequestTimestamp === null ||
        moment().diff(moment(lastRequestTimestamp), 'hours') >=
            COOLDOWN_WAIT_HOURS
    )
}

export const markTrialExtensionRequested = (): void => {
    const timestamp = moment().valueOf()
    localStorage.setItem(TRIAL_EXTENSION_REQUESTED_KEY, timestamp.toString())
}
