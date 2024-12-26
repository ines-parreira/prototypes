import React, {useMemo} from 'react'
import {useLocation} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

import CreateActionFormView from './CreateActionFormView'
import CreateActionView from './CreateActionView'

const CreateActionViewContainer = () => {
    const isActionsMultiStepEnabled = useFlag(
        FeatureFlagKey.ActionsMultiStep,
        false
    )

    const {search} = useLocation()
    const params = useMemo(() => new URLSearchParams(search), [search])
    const templateId = params.get('template_id')

    if (isActionsMultiStepEnabled && !templateId) {
        return <CreateActionView />
    }

    return <CreateActionFormView />
}

export default CreateActionViewContainer
