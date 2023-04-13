import {useCallback, useContext} from 'react'
import {useParams} from 'react-router-dom'

import {fromJS, List, Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import {WizardContext} from 'pages/common/components/wizard/Wizard'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import {DEPRECATED_getIntegrations} from 'state/integrations/selectors'

const useLogWizardEvent = () => {
    const {integrationId} = useParams<{
        integrationId: string
    }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const wizardContext = useContext(WizardContext)
    const integrations: List<Map<any, any>> = useAppSelector(
        DEPRECATED_getIntegrations
    )

    const logWizardEvent = useCallback(
        (event: SegmentEvent, data?: Record<string, any>) => {
            const integration =
                integrations.find(
                    (integration) =>
                        integration?.get('id') === Number(integrationId)
                ) || fromJS({})

            logEvent(event, {
                step: wizardContext?.activeStep,
                account_domain: currentAccount.get('domain'),
                shop_type: integration.getIn(['meta', 'shop_type']),
                ...data,
            })
        },
        [currentAccount, integrations, integrationId, wizardContext?.activeStep]
    )

    return logWizardEvent
}

export default useLogWizardEvent
