import {
    registerAppActivityTrackerHooks,
    unregisterAppActivityTrackerHooks,
} from '@repo/activity-tracker'
import { useEffectOnce } from '@gorgias/toolkit-react'

export function useActivityTracker() {
    useEffectOnce(() => {
        void registerAppActivityTrackerHooks()
        return () => {
            void unregisterAppActivityTrackerHooks()
        }
    })
}
