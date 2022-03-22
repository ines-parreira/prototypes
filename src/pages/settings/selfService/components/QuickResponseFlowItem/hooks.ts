import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import {updateSelfServiceConfiguration} from '../../../../../models/selfServiceConfiguration/resources'
import {QuickReplyPolicy} from '../../../../../models/selfServiceConfiguration/types'
import {selfServiceConfigurationUpdated} from '../../../../../state/entities/selfServiceConfigurations/actions'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import useAppDispatch from '../../../../../hooks/useAppDispatch'

const useUpdateQuickReplyPolicies = () => {
    const configuration = useConfigurationData()
    const dispatch = useAppDispatch()

    const updateQuickReplyPolicies = async (
        newQuickRepliesPolicy: QuickReplyPolicy[]
    ) => {
        if (!configuration || !configuration.configuration?.id) {
            throw new Error('id is not present in self service configuration')
        }

        const newConfiguration = {
            ...configuration.configuration,
            quick_response_policies: newQuickRepliesPolicy,
        }

        try {
            const res = await updateSelfServiceConfiguration(newConfiguration)
            void dispatch(selfServiceConfigurationUpdated(res))
            void (await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Flow successfully updated',
                })
            ))
        } catch (error) {
            void (await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update flow, please try again later',
                })
            ))
        }
    }

    return {updateQuickReplyPolicies}
}

export default useUpdateQuickReplyPolicies
