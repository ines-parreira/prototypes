import {
    registerAppActivityTrackerHooks,
    unregisterAppActivityTrackerHooks,
} from '@repo/activity-tracker'
import { useEffectOnce } from '@gorgias/toolkit-react'

export default function useActivityTracker() {
    useEffectOnce(() => {
        void registerAppActivityTrackerHooks()
        return () => {
            void unregisterAppActivityTrackerHooks()
        }
    })
}
