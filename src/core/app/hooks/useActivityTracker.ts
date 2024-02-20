import useEffectOnce from 'hooks/useEffectOnce'
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
