import React, {useMemo} from 'react'
import {useLocation} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'

import CreateActionFormView from './CreateActionFormView'
import CreateActionView from './CreateActionView'

const CreateActionViewContainer = () => {
    const isActionsMultiStepEnabled = useFlag(FeatureFlagKey.ActionsMultiStep)

    const {search} = useLocation()
    const params = useMemo(() => new URLSearchParams(search), [search])
    const templateId = params.get('template_id')

    if (isActionsMultiStepEnabled && !templateId) {
        return <CreateActionView />
    }

    return <CreateActionFormView />
}

export default CreateActionViewContainer
