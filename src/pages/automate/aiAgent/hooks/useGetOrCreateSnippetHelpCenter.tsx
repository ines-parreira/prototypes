import {useEffect, useState} from 'react'
import {reportError} from 'utils/errors'
import {useCreateStoreSnippetHelpCenter} from 'models/aiAgent/queries'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HelpCenter} from 'models/helpCenter/types'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'

type Props = {
    accountDomain: string
    shopName: string
}

export const useGetOrCreateSnippetHelpCenter = ({
    accountDomain,
    shopName,
}: Props): HelpCenter | null => {
    const [helpCenter, setHelpCenter] = useState<HelpCenter | null>(null)

    const {
        data: existingHelpCenterRes,
        error: existingHelpCenterError,
        isLoading: isLoadingHelpCenter,
    } = useGetHelpCenterList({
        type: 'snippet',
        per_page: 1,
        shop_name: shopName,
    })

    const helpCenterData = existingHelpCenterRes?.data.data[0]

    const {mutateAsync: createHelpCenter, isLoading: isCreatingHelpCenter} =
        useCreateStoreSnippetHelpCenter({
            onError: (error) => {
                reportError(error, {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
                    extra: {
                        context: `Failed to fetch or create help center for ${accountDomain} ${shopName}`,
                    },
                })
            },
        })

    useEffect(() => {
        const fetchOrCreateHelpCenter = async () => {
            if (helpCenterData) {
                setHelpCenter(helpCenterData)
            } else if (!isLoadingHelpCenter && !existingHelpCenterError) {
                const createdHelpCenterRes = await createHelpCenter([
                    accountDomain,
                    shopName,
                ])
                setHelpCenter(createdHelpCenterRes.data)
            }
        }

        if (!helpCenter && !isLoadingHelpCenter && !isCreatingHelpCenter) {
            void fetchOrCreateHelpCenter()
        }
    }, [
        helpCenter,
        shopName,
        accountDomain,
        helpCenterData,
        existingHelpCenterError,
        createHelpCenter,
        isLoadingHelpCenter,
        isCreatingHelpCenter,
    ])

    return helpCenter
}
