import { useCallback, useRef, useState } from 'react'

import { Button } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import useAppSelector from 'hooks/useAppSelector'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import type { FileFieldContainer } from 'pages/common/forms/FileField'
import FileField from 'pages/common/forms/FileField'
import { getCurrentIntegration } from 'state/integrations/selectors'

import css from './LogoUpload.less'

type LogoUploadProps = {
    url?: string
    onChange: (url?: string) => void
}

const MAX_SIZE = 500 * 1000 // 500KB

export function LogoUpload({ url, onChange }: LogoUploadProps) {
    const fileFieldRef = useRef<FileFieldContainer>(null)
    const [isUploading, setIsUploading] = useState(false)
    const integration = useAppSelector(getCurrentIntegration)

    const handleButtonClick = useCallback(() => {
        fileFieldRef.current?.handleButtonClick()
    }, [])

    const handleRemove = useCallback(() => {
        fileFieldRef.current?.handleRemove()
    }, [])

    return (
        <div className={css.container}>
            {/* TODO discuss filled in state with design */}
            {url ? (
                <div className={css.previewContainer}>
                    <div className={css.preview}>
                        <img
                            src={url}
                            alt="Logo"
                            className={css.previewImage}
                        />
                    </div>
                    <button
                        type="button"
                        className={css.removeButton}
                        onClick={handleRemove}
                        aria-label="Remove logo"
                    >
                        <i className="material-icons">close</i>
                    </button>
                </div>
            ) : (
                <Button
                    variant="secondary"
                    onClick={handleButtonClick}
                    isLoading={isUploading}
                >
                    <ButtonIconLabel icon="add">Add logo</ButtonIconLabel>
                </Button>
            )}

            <div className="d-none">
                <FileField
                    ref={fileFieldRef}
                    params={{
                        integration_id: integration.get('id'),
                    }}
                    isRemovable={false}
                    returnFiles={false}
                    noPreview={true}
                    onChange={onChange}
                    onUploadStatusChange={setIsUploading}
                    uploadType={UploadType.Avatar}
                    maxSize={MAX_SIZE}
                />
            </div>
        </div>
    )
}
