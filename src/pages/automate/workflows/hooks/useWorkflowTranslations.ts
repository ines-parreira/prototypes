/**
 * This hook will maintain (fetch & save) all translations dictionaries for a workflow configuration loaded in the editor.
 * It will also maintain the current language in edition.
 * It is used by the useWorkflowEditor one: from its perspective, the text of workflow configurations are read and edited directly
 * and the useWorkflowTranslations hook will extract those and save them in the backend with the correct lifecycle.
 *
 * Note that on first load, the workflows API already returns the workflow configuration with translated texts,
 * even if text are emptied on save and saved in a translation dictionary instead.
 */
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _keys from 'lodash/keys'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _mapValues from 'lodash/mapValues'

import {LanguageCode} from '../models/workflowConfiguration.types'
import {VisualBuilderGraph} from '../models/visualBuilderGraph.types'
import {
    getPayloadSizeToLimitRate,
    isPayloadTooLarge,
} from '../utils/payloadSize'
import {migrateBracketNotationToDotNotation} from '../models/variables.model'
import useWorkflowApi from './useWorkflowApi'

type TranslationsByLang = Record<string, Record<string, string>>

export default function useWorkflowTranslations(
    configurationInternalId: string,
    availableLanguages: LanguageCode[],
    isNew: boolean,
    isWorkflowLoaded: boolean
) {
    const {
        fetchWorkflowTranslations,
        upsertWorkflowTranslations,
        deleteWorkflowTranslations,
    } = useWorkflowApi()
    const [translationsByLang, setTranslationsByLang] =
        useState<TranslationsByLang>({})
    const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(
        availableLanguages[0]
    )
    const [translationsByLangDirty, setTranslationsByLangDirty] =
        useState<TranslationsByLang>({})
    const originalLanguage = useRef<LanguageCode>(availableLanguages[0])

    // on editor load, fetch the translations for all available languages
    useEffect(() => {
        if (
            isNew ||
            !isWorkflowLoaded ||
            Object.keys(translationsByLang).length > 0
        )
            return
        async function f() {
            const langTranslationsPair = await Promise.all(
                availableLanguages.map(
                    async (lang) =>
                        [
                            lang,
                            await fetchWorkflowTranslations(
                                configurationInternalId,
                                lang
                            ),
                        ] as [string, Record<string, string>]
                )
            )
            if (!configurationInternalId) return
            const translationsByLang = langTranslationsPair.reduce(
                (acc, [lang, translations]) => ({
                    ...acc,
                    [lang]: Object.entries(translations ?? {}).reduce<
                        Record<string, string>
                    >(
                        (acc, [key, value]) => ({
                            ...acc,
                            [key]: migrateBracketNotationToDotNotation(value),
                        }),
                        {}
                    ),
                }),
                {} as TranslationsByLang
            )
            setTranslationsByLang(translationsByLang)
            setTranslationsByLangDirty(translationsByLang)
        }
        void f()
    }, [
        fetchWorkflowTranslations,
        configurationInternalId,
        translationsByLang,
        availableLanguages,
        isNew,
        isWorkflowLoaded,
    ])

    const computeCurrentTranslationSizeToLimitRate = useCallback(
        (graph: VisualBuilderGraph) => {
            const translations = snapshotTranslations(
                graph,
                currentLanguage,
                translationsByLangDirty
            )[currentLanguage]
            return getPayloadSizeToLimitRate(translations)
        },
        [currentLanguage, translationsByLangDirty]
    )

    // to be used to compare against the initially fetched configuration to determine if it's dirty or not
    // TODO make node ids and edge ids stable so that we can compare the graphes directly
    const translateWithSavedTranslations = useCallback(
        (graph: VisualBuilderGraph) =>
            translateDeep(graph, translationsByLang[currentLanguage] ?? {}, {
                doNotFallback: false,
            }),
        [translationsByLang, currentLanguage]
    )

    const saveTranslations = useCallback(
        async (graph: VisualBuilderGraph) => {
            if (!configurationInternalId) return
            const nextTranslationsByLangDirty = snapshotTranslations(
                graph,
                currentLanguage,
                translationsByLangDirty
            )

            for (const languageCode of availableLanguages) {
                if (
                    !_isEqual(
                        nextTranslationsByLangDirty[languageCode],
                        translationsByLang[languageCode]
                    )
                ) {
                    await upsertWorkflowTranslations(
                        configurationInternalId,
                        languageCode,
                        nextTranslationsByLangDirty[languageCode]
                    )
                }
            }
            for (const languageCode of Object.keys(translationsByLang).filter(
                (lang) => !availableLanguages.includes(lang as LanguageCode)
            )) {
                await deleteWorkflowTranslations(
                    configurationInternalId,
                    languageCode
                )
            }
            setTranslationsByLang(nextTranslationsByLangDirty)
            setTranslationsByLangDirty(nextTranslationsByLangDirty)
        },
        [
            availableLanguages,
            configurationInternalId,
            upsertWorkflowTranslations,
            deleteWorkflowTranslations,
            currentLanguage,
            translationsByLang,
            translationsByLangDirty,
        ]
    )

    const getLangsOfIncompleteTranslations = useCallback(
        (graph: VisualBuilderGraph) => {
            const nextTranslationsByLangDirty = snapshotTranslations(
                graph,
                currentLanguage,
                translationsByLangDirty
            )
            const allTkeys = collectTkeys(graph)
            const incompleteLangs: LanguageCode[] = []
            Object.entries(nextTranslationsByLangDirty).forEach(
                ([lang, translations]) => {
                    if (!allTkeys.every((tkey) => translations[tkey])) {
                        incompleteLangs.push(lang as LanguageCode)
                    }
                }
            )
            return incompleteLangs
        },
        [translationsByLangDirty, currentLanguage]
    )

    const discardTranslations = useCallback(() => {
        setTranslationsByLangDirty(translationsByLang)
        setCurrentLanguage(originalLanguage.current)
    }, [translationsByLang, setTranslationsByLangDirty, setCurrentLanguage])

    const translateKey = useCallback(
        (tkey: string, languageCode: LanguageCode) =>
            translationsByLangDirty[languageCode]?.[tkey] ?? '',
        [translationsByLangDirty]
    )

    const switchLanguage = useCallback(
        (graph: VisualBuilderGraph, nextLanguage: LanguageCode) => {
            let nextGraph = graph
            if (!availableLanguages.includes(nextLanguage)) {
                nextGraph = {
                    ...nextGraph,
                    available_languages: [
                        ...(nextGraph.available_languages ?? []),
                        nextLanguage,
                    ],
                }
            }
            const nextTranslationsByLangDirty = snapshotTranslations(
                graph,
                currentLanguage,
                translationsByLangDirty
            )
            setTranslationsByLangDirty(nextTranslationsByLangDirty)
            setCurrentLanguage(nextLanguage)
            return translateDeep(
                nextGraph,
                nextTranslationsByLangDirty[nextLanguage] ?? {},
                {doNotFallback: true}
            )
        },
        [availableLanguages, translationsByLangDirty, currentLanguage]
    )

    const translateGraph = useCallback(
        (graph: VisualBuilderGraph, language: LanguageCode) => {
            let translationsByLang = translationsByLangDirty
            // snapshot the current language translations if needed
            if (language === currentLanguage) {
                translationsByLang = snapshotTranslations(
                    graph,
                    currentLanguage,
                    translationsByLangDirty
                )
            }
            return translateDeep(graph, translationsByLang[language] ?? {}, {
                doNotFallback: true,
            })
        },
        [translationsByLangDirty, currentLanguage]
    )

    const deleteTranslation = useCallback(
        (graph: VisualBuilderGraph, languageCode: LanguageCode) => {
            let g = graph
            if (currentLanguage === languageCode) {
                g = switchLanguage(
                    graph,
                    availableLanguages.filter((l) => l !== languageCode)[0]
                )
            }
            setTranslationsByLangDirty((translationsByLangDirty) =>
                _omit(translationsByLangDirty, languageCode)
            )
            return {
                ...g,
                available_languages: g.available_languages?.filter(
                    (lang) => lang !== languageCode
                ),
            }
        },
        [currentLanguage, availableLanguages, switchLanguage]
    )
    const getLangsOfTooLargeTranslations = useCallback(
        (graph: VisualBuilderGraph) => {
            const nextTranslationsByLangDirty = snapshotTranslations(
                graph,
                currentLanguage,
                translationsByLangDirty
            )
            const tooLargeLangs: LanguageCode[] = []
            Object.entries(nextTranslationsByLangDirty).forEach(
                ([lang, translations]) => {
                    if (isPayloadTooLarge(translations)) {
                        tooLargeLangs.push(lang as LanguageCode)
                    }
                }
            )
            return tooLargeLangs
        },
        [currentLanguage, translationsByLangDirty]
    )

    const areTranslationsDirty = useMemo(
        () =>
            availableLanguages.find(
                (languageCode) =>
                    !_isEqual(
                        translationsByLang[languageCode],
                        translationsByLangDirty[languageCode]
                    )
            ) != null,
        [availableLanguages, translationsByLang, translationsByLangDirty]
    )

    return {
        currentLanguage,
        translateWithSavedTranslations,
        saveTranslations,
        deleteTranslation,
        areTranslationsDirty,
        getLangsOfIncompleteTranslations,
        discardTranslations,
        translateKey,
        setCurrentLanguage,
        switchLanguage,
        getLangsOfTooLargeTranslations,
        translateGraph,
        computeCurrentTranslationSizeToLimitRate,
    }
}

// will walk the datastructure recursively, depth first
// replacing the values with the value returned by the objectMapper provided
function walkDeep<T>(
    value: T,
    elementMapper: (v: any) => any | null,
    options?: {ignoreKeys?: string[]}
): T {
    if (_isArray(value)) {
        const withValuesMapped = value.map((el) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            walkDeep(el, elementMapper)
        )
        return elementMapper(withValuesMapped) as T
    } else if (_isObject(value)) {
        const withValuesMapped = _mapValues(value, (v, k) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            if (options?.ignoreKeys?.includes(k)) return v
            return walkDeep(v, elementMapper)
        })
        return elementMapper(withValuesMapped) as T
    }
    return elementMapper(value) as T
}

function translateDeep<T>(
    o: T,
    translationDict: Record<string, string>,
    options?: {doNotFallback?: boolean}
): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return walkDeep(
        o,
        (el) => {
            if (_isObject(el)) {
                const tkeys = _keys(el).filter((k) => k.match(/_tkey$/))
                return tkeys.reduce((acc, tkey) => {
                    const translatedKey = tkey.replace(/_tkey$/, '')
                    const translatedValue =
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        translationDict[_get(el, tkey)] ??
                        (options?.doNotFallback
                            ? ''
                            : _get(el, translatedKey) ?? '')
                    return {
                        ...acc,
                        [translatedKey]: translatedValue,
                    }
                }, el)
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return el
        },
        {ignoreKeys: ['wfConfigurationOriginal']}
    )
}

function snapshotTranslations(
    graph: VisualBuilderGraph,
    currentLanguage: LanguageCode,
    translationsByLang: TranslationsByLang
): TranslationsByLang {
    const translations: Record<string, string> = {}
    walkDeep(
        graph,
        (el) => {
            if (_isObject(el)) {
                const tkeys = _keys(el).filter((k) => k.match(/_tkey$/))
                tkeys.forEach((tkey) => {
                    const translatedKey = tkey.replace(/_tkey$/, '')
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    translations[_get(el, tkey)] = _get(el, translatedKey) ?? ''
                })
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return el
        },
        {ignoreKeys: ['wfConfigurationOriginal']}
    )
    return {
        ...translationsByLang,
        [currentLanguage]: translations,
    }
}

function collectTkeys(graph: VisualBuilderGraph): string[] {
    const allTkeys: string[] = []
    walkDeep(
        graph,
        (el) => {
            if (_isObject(el)) {
                const tkeys = _keys(el).filter((k) => k.match(/_tkey$/))
                tkeys.forEach((tkey) => {
                    allTkeys.push(_get(el, tkey) as string)
                })
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return el
        },
        {ignoreKeys: ['wfConfigurationOriginal']}
    )
    return allTkeys
}

export function emptyTranslatedTexts<T>(o: T): T {
    return walkDeep(o, (el) => {
        if (_isObject(el)) {
            const tkeys = _keys(el).filter((k) => k.match(/_tkey$/))
            return tkeys.reduce((acc, tkey) => {
                const translatedKey = tkey.replace(/_tkey$/, '')
                return {
                    ...acc,
                    [translatedKey]: '',
                }
            }, el)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return el
    })
}
