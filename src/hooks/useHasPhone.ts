import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import {hasIntegrationOfTypes} from 'state/integrations/selectors'

export default function useHasPhone() {
    return useAppSelector(hasIntegrationOfTypes(IntegrationType.Phone))
}
