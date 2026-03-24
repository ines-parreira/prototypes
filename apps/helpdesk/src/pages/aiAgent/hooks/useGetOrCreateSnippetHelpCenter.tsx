import { useEffect, useMemo, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useCreateStoreSnippetHelpCenter } from 'models/aiAgent/queries'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'

type Props = {
    accountDomain: string
    shopName: string
}

export const useGetOrCreateSnippetHelpCenter = ({
    accountDomain,
    shopName,
}: Props): { helpCenter: HelpCenter | null; isLoading: boolean } => {
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

    const {
        mutateAsync: createHelpCenter,
        isLoading: isCreatingHelpCenter,
        status: creationStatus,
    } = useCreateStoreSnippetHelpCenter({
        onError: (error) => {
            reportError(error, {
                tags: { team: SentryTeam.AI_AGENT },
                extra: {
                    context: `Failed to fetch or create help center for ${accountDomain} ${shopName}`,
                },
            })
        },
    })

    useEffect(() => {
        // As soon as the creation was attempted, we stop calling again the creation attempt.
        // This is a temporary fix to prevent infinite loop of creation attempts.
        // we shouldn't implement a retry mechanism here, but rather configure the retry mechanism in the react-query hook itself
        if (creationStatus !== 'idle') return

        const fetchOrCreateHelpCenter = async () => {
            if (helpCenterData) {
                setHelpCenter(helpCenterData)
            } else if (!isLoadingHelpCenter && !existingHelpCenterError) {
                const createdHelpCenterRes = await createHelpCenter([
                    accountDomain,
                    shopName,
                ])
                // Note: this should not be implemented that way but instead be set in the onSuccess callback of the mutation
                // I'm keeping this for the sake of limiting the changes in this quick PR to solely focus on fixing the infinite loop
                setHelpCenter(createdHelpCenterRes.data)
            }
        }

        if (
            (!helpCenter || helpCenter.shop_name !== shopName) &&
            !isLoadingHelpCenter &&
            !isCreatingHelpCenter
        ) {
            setHelpCenter(null)
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
        creationStatus,
    ])

    const values = useMemo(
        () => ({
            helpCenter:
                isLoadingHelpCenter || isCreatingHelpCenter ? null : helpCenter,
            isLoading: isLoadingHelpCenter || isCreatingHelpCenter,
        }),
        [helpCenter, isLoadingHelpCenter, isCreatingHelpCenter],
    )

    return values
}
