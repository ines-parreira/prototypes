import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Tooltip from 'pages/common/components/Tooltip'
import css from './PublicSourcesSection.less'
import {PublicSourcesItem} from './PublicSourcesItem'
import {SourceItem} from './types'

const SOURCES_LIMIT = 10

type Props = {
    publicSources?: SourceItem[]
}

export const PublicSourcesSection = ({publicSources}: Props) => {
    const [sources, setSources] = useState<SourceItem[]>(publicSources ?? [])
    const onAddClick = () => {
        const newResource: SourceItem = {
            id: Math.random(),
            status: 'idle',
        }
        setSources((prev) => [...prev, newResource])
    }

    const onDeleteSource = (id: number) => {
        setSources((prev) => prev.filter((resource) => resource.id !== id))
    }

    const onSyncSource = (id: number) => {
        // eslint-disable-next-line no-console
        console.log('Syncing source with id:', id)
        // TODO: Add server request here
    }

    const isLimitReached = sources.length >= SOURCES_LIMIT

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
