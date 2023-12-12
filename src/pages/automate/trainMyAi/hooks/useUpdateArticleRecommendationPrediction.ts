import {useQueryClient} from '@tanstack/react-query'

import {errorToChildren} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    useUpdateArticleRecommendationPredictions,
    articleRecommendationdDefinitionKeys,
} from 'models/articleRecommendationPrediction/queries'
import {isGorgiasApiError} from 'models/api/types'

type Props = {
    page: number
    helpCenterId?: number | null
    shopName?: string
    shopType?: string
}

export default function useUpdateArticleRecommendationPrediction({
    page,
    shopName,
    shopType,
    helpCenterId,
}: Props) {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useUpdateArticleRecommendationPredictions({
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey: articleRecommendationdDefinitionKeys.list({
                    page,
                    shopName,
                    shopType,
                    helpCenterId,
                }),
            })
        },
        onError: (error) => {
            void dispatch(
                notify({
                    title: isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Oups something went wrong',
                    message: errorToChildren(error) || undefined,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}
