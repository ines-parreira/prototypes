import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { HelpCenter } from 'models/helpCenter/types'
import { fetchSelfServiceConfigurationSSP } from 'models/selfServiceConfiguration/resources'
import { useSelfServiceConfigurationUpdate } from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import { getHasAutomate } from 'state/billing/selectors'
import { getHelpCenterList } from 'state/entities/helpCenter/helpCenters/selectors'
import { getStoreIntegrations } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useEnableArticleRecommendation = () => {
    const helpCenterList = useAppSelector(getHelpCenterList).filter(
        (helpCenter) => !helpCenter.deactivated_datetime,
    )
    const hasAutomate = useAppSelector(getHasAutomate)
    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const dispatch = useAppDispatch()

    const { handleSelfServiceConfigurationUpdate } =
        useSelfServiceConfigurationUpdate({
            handleNotify: (notification) => {
                if (
                    notification.status === NotificationStatus.Error &&
                    notification.message
                ) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: notification.message,
                        }),
                    )
                }
            },
        })

    return async (newHelpCenter: HelpCenter) => {
        const hasHelpCenterWithSameStore = helpCenterList.find(
            (helpCenter) => helpCenter.shop_name === newHelpCenter.shop_name,
        )

        if (
            !hasAutomate ||
            !newHelpCenter.shop_name ||
            hasHelpCenterWithSameStore
        ) {
            return
        }

        const storeIntegration = storeIntegrations.find(
            (storeIntegrations) =>
                storeIntegrations.name === newHelpCenter.shop_name,
        )

        if (!storeIntegration) {
            return
        }

        try {
            const res = await fetchSelfServiceConfigurationSSP(
                storeIntegration.name,
                storeIntegration.type,
            )

            if (res.articleRecommendationHelpCenterId) {
                return
            }

            return await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.articleRecommendationHelpCenterId = newHelpCenter.id
                },
                {},
                storeIntegration.id,
            )
        } catch (err) {
            console.error(err)
        }
    }
}
