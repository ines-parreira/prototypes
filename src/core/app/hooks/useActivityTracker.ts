import useEffectOnce from 'hooks/useEffectOnce'
import {
    registerActivityTrackerHooks,
    unregisterActivityTrackerHooks,
} from 'services/activityTracker'

export default function useActivityTracker() {
    useEffectOnce(() => {
        void registerActivityTrackerHooks()
        return () => {
            void unregisterActivityTrackerHooks()
        }
    })
}
