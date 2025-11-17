import type React from 'react'
import { useState } from 'react'

import classNames from 'classnames'

import { LoadingSpinner } from '@gorgias/axiom'

import type { FetchedProvidersState } from '../../../../types'

import css from './DropAreas.less'

type Props = {
    onUploadCSVClick: () => void
    onFileDrop: React.DragEventHandler<HTMLDivElement>
    fetchedProviders: FetchedProvidersState
    onMigrationDropAreaClick: () => void
    isMigrationAvailable: boolean
}

const DropAreas: React.FC<Props> = ({
    fetchedProviders,
    onUploadCSVClick,
    onFileDrop,
    onMigrationDropAreaClick,
    isMigrationAvailable,
}) => {
    const [dragOver, setDragOver] = useState(false)

    const migrationDropAreaDisabled = fetchedProviders.isLoading

    return (
        <div className={css.dropAreasContainer}>
            <div
                data-testid="import-articles-modal-file-drop-area"
                className={classNames(css.fileDropArea, {
                    [css.dragOver]: dragOver,
                })}
                onClick={onUploadCSVClick}
                onDragEnter={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                }}
                onDragOver={(e) => {
                    e.preventDefault()
                }}
                onDrop={(e) => {
                    onFileDrop(e)
                    setDragOver(false)
                }}
                onDragLeave={() => {
                    setDragOver(false)
                }}
            >
                {/* Need to disable pointer events as the inside elements are interupting drag */}
                <div
                    style={{
                        pointerEvents: dragOver ? 'none' : undefined,
                    }}
                >
                    <i
                        className={classNames(
                            'material-icons',
                            css.modalCloudIcon,
                        )}
                    >
                        cloud_upload
                    </i>

                    <b className={css.dropAreaText}>
                        Drop your CSV here, or{' '}
                        <a
                            href=""
                            onClick={(ev) => {
                                ev.preventDefault()
                            }}
                        >
                            browse
                        </a>
                    </b>
                </div>
            </div>

            {!fetchedProviders.isError && isMigrationAvailable && (
                <div
                    className={classNames(css.fileDropArea, {
                        [css.disabled]: migrationDropAreaDisabled,
                    })}
                    onClick={
                        !migrationDropAreaDisabled
                            ? onMigrationDropAreaClick
                            : undefined
                    }
                >
                    <span className={css.supportedProvidersText}>
                        Currently supported providers:
                    </span>

                    <div className={css.providersLogosContainer}>
                        {fetchedProviders.isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            fetchedProviders.data &&
                            fetchedProviders.data.map((provider, idx) => (
                                <img
                                    key={idx}
                                    src={provider.logo_url}
                                    alt={provider.title}
                                    className={css.providerLogo}
                                />
                            ))
                        )}
                    </div>
                    <b className={css.dropAreaText}>
                        Import from another provider
                    </b>
                </div>
            )}
        </div>
    )
}

export default DropAreas
