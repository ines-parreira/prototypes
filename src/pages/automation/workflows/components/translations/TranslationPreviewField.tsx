import React from 'react'

import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import {useTranslationsPreviewContext} from 'pages/automation/workflows/hooks/useTranslationsPreviewContext'

import css from './TranslationPreviewField.less'

export default function TranslationsPreviewField({tkey}: {tkey: string}) {
    const {translateKey} = useWorkflowEditorContext()
    const {previewLanguageList, previewLanguage} =
        useTranslationsPreviewContext()
    if (previewLanguageList.length === 0 || previewLanguage == null) return null
    return (
        <div className={css.previewField}>
            {translateKey(tkey, previewLanguage)}
        </div>
    )
}
