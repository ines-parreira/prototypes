import {
    registerAppActivityTrackerHooks,
    unregisterAppActivityTrackerHooks,
} from '@repo/activity-tracker'
import { useEffectOnce } from '@repo/hooks'

export default function useActivityTracker() {
    useEffectOnce(() => {
        void registerAppActivityTrackerHooks()
        return () => {
            void unregisterAppActivityTrackerHooks()
        }
    })
}
