import { useMemo } from 'react'

import {
    LLMPromptTriggerNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useSplitLLMPromptTriggerInputs = (
    inputs: LLMPromptTriggerNodeType['data']['inputs'],
    nodes: VisualBuilderGraph['nodes'],
) => {
    return useMemo(() => {
        const templateInputs = nodes.reduce<string[]>((inputs, node) => {
            let nextInputs = inputs

            if (node.type === 'reusable_llm_prompt_call') {
                if (node.data.custom_inputs) {
                    nextInputs = [
                        ...nextInputs,
                        ...Object.values(node.data.custom_inputs),
                    ]
                }

                if (node.data.objects?.products) {
                    nextInputs = [
                        ...nextInputs,
                        ...Object.values(node.data.objects.products),
                    ]
                }
            }

            return nextInputs
        }, [])

        return inputs.reduce<
            [
                LLMPromptTriggerNodeType['data']['inputs'],
                LLMPromptTriggerNodeType['data']['inputs'],
            ]
        >(
            (inputsTuple, input) => {
                if ('data_type' in input) {
                    if (
                        templateInputs.includes(`{{custom_inputs.${input.id}}}`)
                    ) {
                        return [inputsTuple[0], [...inputsTuple[1], input]]
                    }

                    return [[...inputsTuple[0], input], inputsTuple[1]]
                }

                if ('kind' in input && input.kind === 'product') {
                    if (
                        templateInputs.includes(
                            `{{objects.products.${input.id}}}`,
                        )
                    ) {
                        return [inputsTuple[0], [...inputsTuple[1], input]]
                    }

                    return [[...inputsTuple[0], input], inputsTuple[1]]
                }

                return inputsTuple
            },
            [[], []],
        )
    }, [inputs, nodes])
}

export default useSplitLLMPromptTriggerInputs
