import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAutomatePlan } from 'state/billing/selectors'

export const useGetSkillsetStep = () => {
    const automatePlanId = useAppSelector(getCurrentAutomatePlan)?.plan_id ?? ''

    return { hasSkillsetStep: !automatePlanId.includes('usd-6') }
}
