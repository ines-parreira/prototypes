import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Tooltip from 'pages/common/components/Tooltip'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {usePublicResources} from '../../hooks/usePublicResources'
import {usePublicResourceMutation} from '../../hooks/usePublicResourcesMutation'
import {usePublicResourcesPooling} from '../../hooks/usePublicResourcesPooling'
import css from './PublicSourcesSection.less'
import {PublicSourcesItem} from './PublicSourcesItem'
import {SourceItem} from './types'
import {mergeSources} from './utils'

const SOURCES_LIMIT = 10

type Props = {
    helpCenterId: number
    shopName: string
}

export const PublicSourcesSection = ({helpCenterId, shopName}: Props) => {
    const dispatch = useAppDispatch()

    const {sourceItems} = usePublicResources({
        helpCenterId,
    })
    usePublicResourcesPooling({helpCenterId, shopName})
    const {deletePublicResource, addPublicResource} = usePublicResourceMutation(
        {helpCenterId}
    )
    const [sources, setSources] = useState<SourceItem[]>(sourceItems ?? [])

    useEffect(() => {
        if (sourceItems) {
            setSources((prevSources) => mergeSources(prevSources, sourceItems))
        }
    }, [sourceItems])

    const onAddClick = () => {
        const newResource: SourceItem = {
            id: Math.random(),
            status: 'idle',
        }
        setSources((prev) => [...prev, newResource])
    }

    const onDeleteSource = async (source: SourceItem) => {
        setSources((prev) =>
            prev.filter((resource) => resource.id !== source.id)
        )

        if (source.status === 'idle') return

        try {
            await deletePublicResource(source.id)

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Public URL successfully deleted',
                })
            )
        } catch (error) {
            setSources((prev) => [...prev, source])
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during Public URL deletion. Try one more time or contact support',
                })
            )
        }
    }

    const onSyncSource = async (url: string, sourceId: number) => {
        try {
            setSources((prev) =>
                prev.map((source) =>
                    source.id === sourceId
                        ? {...source, status: 'loading', url}
                        : {...source}
                )
            )
            await addPublicResource([url])
        } catch (error) {
            setSources((prev) =>
                prev.map((source) =>
                    source.id === sourceId
                        ? {...source, status: 'error'}
                        : {...source}
                )
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during Public URL sync. Try different URL or contact support',
                })
            )
        }
    }

    const isLimitReached = sources.length >= SOURCES_LIMIT
    const existingUrls = sources
        .map((s) => s.url)
        .filter((url): url is string => !!url)

    return (
        <div className={css.container}>
            <div>
                <h3 className={css.title}>Public URL sources</h3>
                <div>
                    AI Agent will fetch the text from up to {SOURCES_LIMIT}{' '}
                    URLs. Images and video content will not be used.
                </div>
            </div>

            {sources.length > 0 && (
                <ul className={css.list}>
                    {sources.map((source) => (
                        <li key={source.id} data-testid="source-item">
                            <PublicSourcesItem
                                existingUrls={existingUrls}
                                source={source}
                                onDelete={onDeleteSource}
                                onSync={onSyncSource}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div>
                {isLimitReached && (
                    <Tooltip target="add-button">
                        You have reached the maximum number of URLs.
                    </Tooltip>
                )}

                <Button
                    id="add-button"
                    data-testid="add-button"
                    intent="secondary"
                    onClick={onAddClick}
                    isDisabled={isLimitReached}
                    disabled={isLimitReached}
                >
                    <ButtonIconLabel icon="add">Add URL</ButtonIconLabel>
                </Button>
            </div>
        </div>
    )
}
