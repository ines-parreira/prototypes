import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'

import {TemplateConfiguration} from '../types'

const useEnabledActionTemplates = (allTemplates: TemplateConfiguration[]) => {
    const enabledTemplates:
        | TemplateConfiguration['internal_id'][]
        | Record<never, never>
        | undefined = useFlags()[FeatureFlagKey.ActionTemplates]

    return useMemo(() => {
        return allTemplates.filter(
            (template) =>
                !template.category &&
                (!Array.isArray(enabledTemplates) ||
                    !!enabledTemplates.includes(template.internal_id))
        )
    }, [allTemplates, enabledTemplates])
}

export default useEnabledActionTemplates
