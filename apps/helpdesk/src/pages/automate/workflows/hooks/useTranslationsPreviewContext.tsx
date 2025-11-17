import type React from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { VisualBuilderGraph } from '../models/visualBuilderGraph.types'
import type { LanguageCode } from '../models/workflowConfiguration.types'
import { useWorkflowEditorContext } from './useWorkflowEditor'

export const TranslationsPreviewContext = createContext<
    | {
          previewLanguageList: LanguageCode[]
          previewLanguage?: LanguageCode | null
          setPreviewLanguage: (language: LanguageCode) => void
          translatedGraph: VisualBuilderGraph
      }
    | undefined
>(undefined)

export function useTranslationsPreviewContext() {
    const context = useContext(TranslationsPreviewContext)
    if (!context)
        throw new Error(
            'usePreviewTranslation must be used within a TranslationsPreviewProvider',
        )
    return context
}

export function TranslationsPreviewProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const { visualBuilderGraph, currentLanguage, translateGraph } =
        useWorkflowEditorContext()
    const previewLanguageList = useMemo(
        () =>
            visualBuilderGraph.available_languages.filter(
                (l) => l !== currentLanguage,
            ),
        [visualBuilderGraph.available_languages, currentLanguage],
    )
    const defaultPreviewLanguage: LanguageCode | undefined = useMemo(
        () => previewLanguageList?.[0],
        [previewLanguageList],
    )
    const [previewLanguage, setPreviewLanguage] = useState<
        LanguageCode | undefined
    >(defaultPreviewLanguage)
    const translatedGraph = useMemo(() => {
        if (!previewLanguage) return visualBuilderGraph
        return translateGraph(visualBuilderGraph, previewLanguage)
    }, [visualBuilderGraph, translateGraph, previewLanguage])
    const translationsPreviewContext = useMemo(
        () => ({
            previewLanguageList,
            previewLanguage,
            setPreviewLanguage,
            translatedGraph,
        }),
        [
            previewLanguageList,
            previewLanguage,
            setPreviewLanguage,
            translatedGraph,
        ],
    )

    useEffect(() => {
        if (!previewLanguage || !previewLanguageList.includes(previewLanguage))
            setPreviewLanguage(defaultPreviewLanguage)
    }, [previewLanguage, previewLanguageList, defaultPreviewLanguage])

    return (
        <TranslationsPreviewContext.Provider value={translationsPreviewContext}>
            {children}
        </TranslationsPreviewContext.Provider>
    )
}
