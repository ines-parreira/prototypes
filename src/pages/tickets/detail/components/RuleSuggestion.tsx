import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {FeatureFlagKey} from 'config/featureFlags'

const RuleSuggestion = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const ruleSuggestionFeatureFlag = useFlags()[FeatureFlagKey.RuleSuggestion]

    const hasActions = true //TODO Check if the rule suggestion has actions. It may mot as rule recipe events are purged after one month

    return hasAutomationAddOn && ruleSuggestionFeatureFlag && hasActions ? (
        <div>Gorgias tips placeholder</div>
    ) : null
}

export default RuleSuggestion
