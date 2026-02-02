import pluralize from 'pluralize'

import { Banner, Skeleton } from '@gorgias/axiom'
import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

export const VoiceSlaTargetInfoBanner = () => {
    const { data, isLoading } = useListSlaPolicies({
        target_channel: 'phone',
    })

    if (isLoading) {
        return <Skeleton />
    }

    const policy = data?.data?.data?.[0]

    if (!policy || !policy.target || !policy.metrics?.[0]?.unit) {
        return null
    }

    return (
        <Banner
            isClosable
            description={`Your current Voice SLA policy is ${Number(policy.target) * 100}% within ${policy.metrics[0].threshold} ${pluralize(policy.metrics[0].unit)}.`}
        />
    )
}
