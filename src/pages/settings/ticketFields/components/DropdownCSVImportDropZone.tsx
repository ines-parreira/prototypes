import classNames from 'classnames'
import React, {ChangeEvent, useRef} from 'react'

import FileSelectedArea from 'pages/settings/helpCenter/components/Imports/components/ImportSection/components/ImportArticlesModal/components/FileSelectedArea'
import css from './DropdownCSVImportDropZone.less'

type Props = {
    file: File | null
    setFile: (file: File | null) => void
}

export const DropdownCSVImportDropZone = ({file, setFile}: Props) => {
    const hiddenFileInputRef = useRef<HTMLInputElement>(null)

    const openFileDialog = () => hiddenFileInputRef.current?.click()
    const handleFileDropped = (event: React.DragEvent) => {
        event.preventDefault()
        const file = event.dataTransfer.items[0].getAsFile()
        if (file && file.name.toLocaleLowerCase().endsWith('.csv')) {
            setFile(file)
        }
    }
    const handleFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0])
        }
    }

    return (
        <>
            <input
                type="file"
                accept=".csv"
                ref={hiddenFileInputRef}
                style={{display: 'none'}}
                onChange={handleFileChosen}
            />
            {file ? (
                <FileSelectedArea
                    file={file}
                    onChangeFileClick={openFileDialog}
                />
            ) : (
                <div
                    className={css.fileDropArea}
                    onClick={openFileDialog}
                    onDrop={handleFileDropped}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <i
                        className={classNames(
                            'material-icons',
                            css.modalCloudIcon
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
            )}
        </>
    )
}

export default DropdownCSVImportDropZone
