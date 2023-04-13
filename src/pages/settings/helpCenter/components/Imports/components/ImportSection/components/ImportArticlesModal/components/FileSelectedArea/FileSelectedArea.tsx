import React from 'react'

import Button from 'pages/common/components/button/Button'

import {fileIsTooBig, MAXIMUM_FILE_SIZE_MB} from '../../utils'

import css from './FileSelectedArea.less'

type Props = {
    file: File
    onChangeFileClick: () => void
}

const FileSelectedArea: React.FC<Props> = ({file, onChangeFileClick}) => {
    return (
        <div>
            <div className={css.fileSelectedArea}>
                <div>
                    <i className="material-icons mr-2">insert_drive_file</i>
                    {file.name}
                </div>

                <div>
                    <Button
                        intent="secondary"
                        size="small"
                        onClick={onChangeFileClick}
                    >
                        Replace File
                    </Button>
                </div>
            </div>

            {fileIsTooBig(file) && (
                <div className="text-danger">
                    The size of your file is over {MAXIMUM_FILE_SIZE_MB}MB,
                    please select another file.
                </div>
            )}
        </div>
    )
}

export default FileSelectedArea
