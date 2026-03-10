import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { isGorgiasApiError } from 'models/api/types'
import {
    useKnowledgeHubBulkDelete,
    useKnowledgeHubBulkUpdateVisibility,
} from 'models/helpCenter/knowledgeHub/mutations'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { GroupedKnowledgeItem } from '../types'
import { KnowledgeType } from '../types'

type HelpCenterIds = {
    guidanceHelpCenterId?: number | null
    faqHelpCenterId?: number | null
    snippetHelpCenterId?: number | null
}

type UseBulkKnowledgeActionsParams = {
    helpCenterIds: HelpCenterIds
}

export function useBulkKnowledgeActions({
    helpCenterIds,
}: UseBulkKnowledgeActionsParams) {
    const dispatch = useAppDispatch()
    const accountId = useAppSelector(getCurrentAccountId)

    const queryParams = {
        account_id: accountId,
        guidance_help_center_id: helpCenterIds.guidanceHelpCenterId,
        snippet_help_center_id: helpCenterIds.snippetHelpCenterId,
        faq_help_center_id: helpCenterIds.faqHelpCenterId,
    }

    const deleteMutation = useKnowledgeHubBulkDelete(queryParams)

    const visibilityMutation = useKnowledgeHubBulkUpdateVisibility(queryParams)

    const groupItemsByHelpCenter = (items: GroupedKnowledgeItem[]) => {
        const groups = new Map<number, number[]>()

        items.forEach((item) => {
            let helpCenterId: number | null | undefined

            switch (item.type) {
                case KnowledgeType.Guidance:
                    helpCenterId = helpCenterIds.guidanceHelpCenterId
                    break
                case KnowledgeType.FAQ:
                    helpCenterId = helpCenterIds.faqHelpCenterId
                    break
                default:
                    helpCenterId = helpCenterIds.snippetHelpCenterId
                    break
            }

            if (helpCenterId !== null && helpCenterId) {
                const ids = groups.get(helpCenterId) || []
                ids.push(Number(item.id))
                groups.set(helpCenterId, ids)
            }
        })

        return groups
    }

    const handleBulkDelete = async (items: GroupedKnowledgeItem[]) => {
        const groups = groupItemsByHelpCenter(items)
        try {
            await Promise.all(
                Array.from(groups.entries()).map(([helpCenterId, articleIds]) =>
                    deleteMutation.mutateAsync([
                        undefined,
                        { help_center_id: helpCenterId },
                        { article_ids: articleIds },
                    ]),
                ),
            )
            void dispatch(
                notify({
                    message: 'Successfully deleted items',
                    status: NotificationStatus.Success,
                    showDismissButton: true,
                }),
            )
        } catch (error) {
            void dispatch(
                notify({
                    message: isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Failed to delete items',
                    status: NotificationStatus.Error,
                    showDismissButton: true,
                }),
            )
        }
    }

    const handleBulkVisibilityUpdate = async (
        items: GroupedKnowledgeItem[],
        visibilityStatus: 'PUBLIC' | 'UNLISTED',
    ) => {
        const groups = groupItemsByHelpCenter(items)

        try {
            await Promise.all(
                Array.from(groups.entries()).map(([helpCenterId, articleIds]) =>
                    visibilityMutation.mutateAsync([
                        undefined,
                        { help_center_id: helpCenterId },
                        {
                            article_ids: articleIds,
                            locale_code: 'en-US',
                            visibility_status: visibilityStatus,
                        },
                    ]),
                ),
            )

            const action =
                visibilityStatus === VisibilityStatusEnum.PUBLIC
                    ? 'enabled'
                    : 'disabled'
            void dispatch(
                notify({
                    message: `Successfully ${action} items for AI Agent`,
                    status: NotificationStatus.Success,
                    showDismissButton: true,
                }),
            )
        } catch (error) {
            void dispatch(
                notify({
                    message: isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Failed to update items',
                    status: NotificationStatus.Error,
                    showDismissButton: true,
                }),
            )
        }
    }

    return {
        handleBulkDelete,
        handleBulkEnable: (items: GroupedKnowledgeItem[]) =>
            handleBulkVisibilityUpdate(items, VisibilityStatusEnum.PUBLIC),
        handleBulkDisable: (items: GroupedKnowledgeItem[]) =>
            handleBulkVisibilityUpdate(items, VisibilityStatusEnum.UNLISTED),
        isLoading: deleteMutation.isLoading || visibilityMutation.isLoading,
    }
}
