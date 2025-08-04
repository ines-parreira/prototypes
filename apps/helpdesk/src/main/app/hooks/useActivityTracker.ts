import { useEffectOnce } from '@repo/hooks'

import {
    registerAppActivityTrackerHooks,
    unregisterAppActivityTrackerHooks,
} from 'services/activityTracker'

export default function useActivityTracker() {
    useEffectOnce(() => {
        void registerAppActivityTrackerHooks()
        return () => {
            void unregisterAppActivityTrackerHooks()
        }
    })
}
