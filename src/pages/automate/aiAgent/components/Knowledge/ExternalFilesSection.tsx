import {Label} from '@gorgias/merchant-ui-kit'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './ExternalFilesSection.less'

export const ExternalFilesSection = () => (
    <div className={css.container}>
        <div className={css.section}>
            <Label>External documents</Label>

            <div>
                Upload knowledge and process documents for AI Agent to
                reference. Do not upload files that may contain any sensitive or
                personal information. Images will be ignored.
            </div>
        </div>

        <div className={css.section}>
            <div>
                <Button id="upload-button" intent="secondary">
                    <ButtonIconLabel icon="cloud_upload">
                        Upload File
                    </ButtonIconLabel>
                </Button>
            </div>

            <div className={css.buttonInfo}>
                Supported types: .pdf, .doc, .docx, .ppt, .pptx
            </div>
        </div>
    </div>
)
