import _flatten from 'lodash/flatten'
import {useEffect, useMemo} from 'react'

import {ResourceFeedbackOnMessage} from 'models/aiAgentFeedback/types'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {useGetAICompatibleMacros} from 'models/macro/queries'
import {useGetStoreWorkflowsConfigurations} from 'models/workflows/queries'
import {useFileIngestion} from 'pages/aiAgent/hooks/useFileIngestion'
import {useGuidanceArticles} from 'pages/aiAgent/hooks/useGuidanceArticles'
import {usePublicResources} from 'pages/aiAgent/hooks/usePublicResources'

import {mapResourceLabelToType} from '../components/AIAgentFeedbackBar/utils'

export type UseAIAgentGetOtherResourcesProps = {
    articleHelpCenterId: number
    guidanceHelpCenterId: number
    snippetHelpCenterId: number
    shopName: string
    shopType: string
}

export const useAIAgentGetOtherResources = ({
    articleHelpCenterId,
    guidanceHelpCenterId,
    snippetHelpCenterId,
    shopName,
    shopType,
}: UseAIAgentGetOtherResourcesProps) => {
    /** Fetch articles */
    const getHelpCenterArticles = useGetHelpCenterArticleList(
        articleHelpCenterId,
        {
            version_status: 'latest_draft',
            per_page: 1000,
        },
        {
            refetchOnWindowFocus: false,
        }
    )

    const articlesList = useMemo(() => {
        return getHelpCenterArticles.data?.data
    }, [getHelpCenterArticles.data])

    /** Fetch guidance articles */
    const {guidanceArticles, isGuidanceArticleListLoading} =
        useGuidanceArticles(guidanceHelpCenterId)

    /** Fetch snippets */
    const {sourceItems, isSourceItemsListLoading} = usePublicResources({
        helpCenterId: snippetHelpCenterId,
    })

    /** Fetch file snippets */
    const {ingestedFiles, isIngesting} = useFileIngestion({
        helpCenterId: snippetHelpCenterId,
        onSuccess: () => {},
        onFailure: () => {},
    })

    const successfullyIngestedFiles = useMemo(() => {
        return (
            ingestedFiles?.filter((file) => file.status === 'SUCCESSFUL') ?? []
        )
    }, [ingestedFiles])

    /** Fetch macros */
    const getMacrosList = useGetAICompatibleMacros()

    const macrosList = useMemo(() => {
        return _flatten(getMacrosList.data?.pages.map((page) => page.data.data))
    }, [getMacrosList.data])

    useEffect(() => {
        if (getMacrosList.hasNextPage) {
            void getMacrosList.fetchNextPage()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getMacrosList.data?.pageParams])

    /** Fetch actions */
    const {data: actionsList, isLoading: isActionsListLoading} =
        useGetStoreWorkflowsConfigurations({
            storeName: shopName,
            storeType: shopType,
            triggers: ['llm-prompt'],
        })

    /** Prepare options lists */
    const articlesOptions = useMemo(() => {
        if (!articlesList) {
            return []
        }

        return articlesList.map((article) => ({
            value: article.id,
            label: article.translation.title,
        }))
    }, [articlesList])

    const guidanceOptions = useMemo(() => {
        return guidanceArticles.map((guidance) => ({
            value: guidance.id,
            label: guidance.title,
        }))
    }, [guidanceArticles])

    const snippetsOptions = useMemo(() => {
        return (
            sourceItems?.map((snippet) => ({
                value: snippet.id,
                label: snippet.url || '',
            })) ?? []
        )
    }, [sourceItems])

    const fileSnippetsOptions = useMemo(() => {
        return (
            successfullyIngestedFiles?.map((snippet) => ({
                value: snippet.id,
                label: snippet.filename,
            })) ?? []
        )
    }, [successfullyIngestedFiles])

    const macrosOptions = useMemo(() => {
        return macrosList.map((macro) => ({
            value: macro.id,
            label: macro.name,
        }))
    }, [macrosList])

    const actionsOptions = useMemo(() => {
        return (
            actionsList?.map((action) => ({
                value: action.id,
                label: action.name,
            })) ?? []
        )
    }, [actionsList])

    const isOtherResourceListLoading =
        getHelpCenterArticles.isLoading ||
        getMacrosList.isLoading ||
        isGuidanceArticleListLoading ||
        isSourceItemsListLoading ||
        isActionsListLoading ||
        isIngesting

    const getResourcesFromLabels = (labels: string[]) => {
        const resources: ResourceFeedbackOnMessage[] = []
        labels.forEach((label) => {
            const textArray = label.split('::')
            const text = textArray[textArray.length - 1]
            const type = textArray[textArray.length - 2]
            const resourceType = mapResourceLabelToType(type)

            let resource: ResourceFeedbackOnMessage | undefined
            switch (resourceType) {
                case 'soft_action': {
                    const softAction = actionsOptions.find(
                        (option) => option.label === text
                    )
                    if (softAction) {
                        resource = {
                            type: 'resource',
                            resourceType: 'soft_action',
                            resourceId: softAction.value,
                        }
                    }
                    break
                }
                case 'hard_action': {
                    const hardAction = actionsOptions.find(
                        (option) => option.label === text
                    )
                    if (hardAction) {
                        resource = {
                            type: 'resource',
                            resourceType: 'hard_action',
                            resourceId: hardAction.value,
                        }
                    }
                    break
                }
                case 'guidance': {
                    const guidance = guidanceOptions.find(
                        (option) => option.label === text
                    )
                    if (guidance) {
                        resource = {
                            type: 'resource',
                            resourceType: 'guidance',
                            resourceId: guidance.value.toString(),
                        }
                    }
                    break
                }
                case 'article': {
                    const article = articlesOptions.find(
                        (option) => option.label === text
                    )
                    if (article) {
                        resource = {
                            type: 'resource',
                            resourceType: 'article',
                            resourceId: article.value.toString(),
                        }
                    }
                    break
                }
                case 'macro': {
                    const macro = macrosOptions.find(
                        (option) => option.label === text
                    )
                    if (macro) {
                        resource = {
                            type: 'resource',
                            resourceType: 'macro',
                            resourceId: macro.value!.toString(),
                        }
                    }
                    break
                }
                case 'external_snippet': {
                    const snippet = snippetsOptions.find(
                        (option) => option.label === text
                    )
                    if (snippet) {
                        resource = {
                            type: 'resource',
                            resourceType: 'external_snippet',
                            resourceId: snippet.value.toString(),
                        }
                    }
                    break
                }
                case 'file_external_snippet': {
                    const fileSnippet = fileSnippetsOptions.find(
                        (option) => option.label === text
                    )
                    if (fileSnippet) {
                        resource = {
                            type: 'resource',
                            resourceType: 'file_external_snippet',
                            resourceId: fileSnippet.value.toString(),
                        }
                    }
                    break
                }
                case 'other': {
                    resource = {
                        type: 'resource',
                        resourceType: 'other',
                        resourceId: '1',
                    }
                    break
                }
            }

            if (resource) {
                resources.push(resource)
            }
        })

        return resources
    }

    return {
        articlesOptions,
        guidanceOptions,
        snippetsOptions,
        fileSnippetsOptions,
        macrosOptions,
        actionsOptions,
        isOtherResourceListLoading,
        getResourcesFromLabels,
    }
}
