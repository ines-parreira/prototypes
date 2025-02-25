import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'
import { PhoneIntegration } from 'models/integration/types'
import { deleteIntegration } from 'state/integrations/actions'

export function useDeleteVoiceIntegration(integration: PhoneIntegration) {
    const dispatch = useAppDispatch()

    const [{ loading: isDeleting }, handleDelete] = useAsyncFn(async () => {
        await dispatch(deleteIntegration(fromJS(integration)))
    }, [integration, dispatch])

    return {
        isDeleting,
        handleDelete,
    }
}
