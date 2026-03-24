import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { INITIAL_FORM_VALUES } from '../constants'
import { useStoreConfiguration } from './useStoreConfiguration'
import { useStoreConfigurationMutation } from './useStoreConfigurationMutation'

type UseHandoverTopicsProps = {
    accountDomain: string
    shopName: string
    onClose: () => void
}

export const useHandoverTopics = ({
    accountDomain,
    shopName,
    onClose,
}: UseHandoverTopicsProps) => {
    const [excludedTopics, setExcludedTopics] = useState<string[]>(
        INITIAL_FORM_VALUES.excludedTopics,
    )

    // Fetch the latest store configuration to avoid overwriting changes
    const { storeConfiguration } = useStoreConfiguration({
        shopName,
        accountDomain,
    })

    useEffect(() => {
        if (storeConfiguration) {
            setExcludedTopics(storeConfiguration.excludedTopics)
        }
    }, [storeConfiguration])

    const {
        upsertStoreConfiguration,
        createStoreConfiguration,
        isLoading: isUpsertLoading,
    } = useStoreConfigurationMutation({
        shopName,
        accountDomain,
    })

    const dispatch = useAppDispatch()

    const cleanTopicsList = (topics: string[]): string[] => {
        return topics
            .map((topic) => topic.trim())
            .filter((topic) => topic.length > 0)
    }

    const handleSave = async () => {
        try {
            const cleanedTopics = cleanTopicsList(excludedTopics)

            if (storeConfiguration) {
                await upsertStoreConfiguration({
                    ...storeConfiguration,
                    excludedTopics: cleanedTopics,
                })
            } else {
                await createStoreConfiguration({
                    ...INITIAL_FORM_VALUES,
                    excludedTopics: cleanedTopics,
                    storeName: shopName,
                    helpCenterId: null,
                })
            }

            void dispatch(
                notify({
                    message: 'Handover topics updated successfully!',
                    status: NotificationStatus.Success,
                }),
            )

            onClose()
        } catch (error) {
            reportError(error, {
                tags: { team: SentryTeam.AI_AGENT },
                extra: {
                    shopName,
                    accountDomain,
                },
            })
            void dispatch(
                notify({
                    message: 'Failed to update handover topics',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

    const updateExcludedTopics = (newTopics: string[]) => {
        setExcludedTopics(newTopics)
    }

    const handleCancel = () => {
        setExcludedTopics(
            storeConfiguration?.excludedTopics ||
                INITIAL_FORM_VALUES.excludedTopics,
        )
        onClose()
    }

    return {
        excludedTopics,
        setExcludedTopics: updateExcludedTopics,
        isLoading: isUpsertLoading,
        handleSave,
        handleCancel,
    }
}
