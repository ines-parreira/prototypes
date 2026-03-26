import { useEffect } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'

export default function useApplyWayfindingMs1() {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    useEffect(() => {
        document.body.classList.toggle('wayfindingMs1', hasWayfindingMS1Flag)
        return () => document.body.classList.remove('wayfindingMs1')
    }, [hasWayfindingMS1Flag])
}
