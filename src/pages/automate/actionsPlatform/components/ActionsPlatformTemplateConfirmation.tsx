import React, { useMemo, useState } from 'react'

import _keyBy from 'lodash/keyBy'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import {
    isReusableLLMPromptCallNodeType,
    VisualBuilderNode,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import CheckBox from 'pages/common/forms/CheckBox'

import { ActionTemplate } from '../types'

import css from './ActionsPlatformTemplateConfirmation.less'

type Props = {
    steps: ActionTemplate[]
    nodes: VisualBuilderNode[]
    value: boolean
    onChange: (nextValue: boolean) => void
}

const ActionsPlatformTemplateConfirmation = ({
    steps,
    nodes,
    value,
    onChange,
}: Props) => {
    const [ref, setRef] = useState<HTMLInputElement | null>(null)

    const reusableLLMPromptCallNodes = useMemo(
        () => nodes.filter(isReusableLLMPromptCallNodeType),
        [nodes],
    )

    const isDisabled = useMemo(() => {
        const stepsById = _keyBy(steps, 'id')

        return reusableLLMPromptCallNodes.some((node) => {
            const step = stepsById[node.data.configuration_id]

            if (!step) {
                return false
            }

            return step?.entrypoints?.some(
                (entrypoint) =>
                    entrypoint.kind === 'reusable-llm-prompt-call-step' &&
                    entrypoint.settings.requires_confirmation,
            )
        })
    }, [steps, reusableLLMPromptCallNodes])

    return (
        <>
            <CheckBox
                className={css.container}
                ref={setRef}
                isChecked={value}
                onChange={onChange}
                caption="Recommended for irreversible Actions"
                isDisabled={isDisabled}
            >
                Require customer confirmation to perform Action
            </CheckBox>
            {isDisabled && ref && (
                <Tooltip target={ref} placement="top-start">
                    This Action requires customer confirmation.
                </Tooltip>
            )}
        </>
    )
}

export default ActionsPlatformTemplateConfirmation
