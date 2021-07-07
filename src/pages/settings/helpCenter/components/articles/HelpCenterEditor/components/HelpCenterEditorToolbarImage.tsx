import React, {useState, useRef, useEffect} from 'react'
import {Button} from 'reactstrap'
import classnames from 'classnames'

import FileField from '../../../../../../common/forms/FileField'
import {isUrl} from '../../../../../../../utils'
import {MAX_IMAGE_SIZE} from '../../../../constants'

import {HelpCenterEditorToolbarPopoverButton} from './HelpCenterEditorToolbarPopoverButton'
import css from './HelpCenterEditorToolbarImage.less'

enum InsertImageMode {
    UPLOAD = 'upload',
    URL = 'url',
}

type Props = {
    onChange: (imageSrc: string) => void
}

export const HelpCenterEditorToolbarImage = ({onChange}: Props) => {
    const inputRef = useRef(null)
    const [expanded, setExpanded] = useState(false)
    const [mode, setMode] = useState<InsertImageMode>(InsertImageMode.UPLOAD)
    const [url, setUrl] = useState('')

    useEffect(() => {
        setUrl('')
    }, [expanded])

    const isDisabled = !url || !isUrl(url)

    const handleUpload = (files: Array<{url: string; size: number}>) => {
        files.forEach((file) => {
            onChange(file.url)
        })
        setExpanded(false)
    }

    const handleExternalUrl = () => {
        onChange(url)
        setExpanded(false)
    }

    return (
        <HelpCenterEditorToolbarPopoverButton
            icon="insert_photo"
            isOpen={expanded}
            onOpen={() => setExpanded(true)}
            onClose={() => setExpanded(false)}
        >
            <>
                <div className={css.menu}>
                    <span
                        onClick={() => setMode(InsertImageMode.UPLOAD)}
                        className={classnames({
                            [css.selected]: mode === InsertImageMode.UPLOAD,
                        })}
                    >
                        Upload
                    </span>
                    <span
                        onClick={() => setMode(InsertImageMode.URL)}
                        className={classnames({
                            [css.selected]: mode === InsertImageMode.URL,
                        })}
                    >
                        URL
                    </span>
                </div>
                {mode === InsertImageMode.UPLOAD ? (
                    <FileField
                        key="file"
                        accept="image/*"
                        placeholder="Select image..."
                        onChange={handleUpload}
                        maxSize={MAX_IMAGE_SIZE}
                        returnFiles
                        inline
                        noPreview
                    />
                ) : (
                    <div className="flex">
                        <input
                            className="form-control"
                            key="url"
                            ref={inputRef}
                            type="text"
                            placeholder="External image url..."
                            onChange={(e) => setUrl(e.target.value)}
                            value={url}
                            autoFocus
                        />
                        <Button
                            type="button"
                            color="primary"
                            className="ml-2"
                            disabled={isDisabled}
                            onClick={handleExternalUrl}
                        >
                            Insert
                        </Button>
                    </div>
                )}
            </>
        </HelpCenterEditorToolbarPopoverButton>
    )
}
