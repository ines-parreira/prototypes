import { useCallback, useMemo, useState } from 'react'

import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'

import {
    Banner,
    LegacyButton as Button,
    LegacyCheckBoxField as CheckBoxField,
} from '@gorgias/axiom'

import type { VisualBuilderNode } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { isReusableLLMPromptCallNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { AlertType } from '../../../common/components/Alert/Alert'
import type { ActionTemplate } from '../types'

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
    const [isOpen, setIsOpen] = useState(false)
    const reusableLLMPromptCallNodes = useMemo(
        () => nodes.filter(isReusableLLMPromptCallNodeType),
        [nodes],
    )

    const requiresConfirmationFromSteps = useMemo(() => {
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

    const handleChange = useCallback(
        (nextValue: boolean) => {
            if (requiresConfirmationFromSteps && !nextValue) {
                setIsOpen(true)
                return
            }
            onChange(nextValue)
        },
        [onChange, setIsOpen, requiresConfirmationFromSteps],
    )

    return (
        <>
            <CheckBoxField
                className={css.container}
                value={value}
                onChange={handleChange}
                caption="Recommended for irreversible Actions"
                label="Require customer confirmation to perform Action"
            />
            <Modal
                isOpen={isOpen}
                isClosable={false}
                onClose={_noop}
                size="medium"
            >
                <ModalHeader title="Disable confirmation requirement?" />
                <ModalBody>
                    Turning off this setting may result in the Action being
                    executed in unintended situations, such as AI Agent
                    misunderstanding the customers&apos; request.
                    <br />
                    <b>We highly recommend you keep this setting enabled.</b>
                    <a
                        className={css.link}
                        href="https://docs.gorgias.com/en-US/articles/connect-ai-agent-with-other-tools-184201"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="material-icons mr-1">menu_book</i>
                        Learn more about Actions configuration options
                    </a>
                    <Banner
                        variant="inline"
                        type={AlertType.Warning}
                        className={css.banner}
                    >
                        You can always re-enable this setting at a later time.
                    </Banner>
                </ModalBody>
                <ModalActionsFooter className={css.footer}>
                    <Button intent="secondary" onClick={() => setIsOpen(false)}>
                        Back To Editing
                    </Button>
                    <Button
                        intent="destructive"
                        onClick={() => {
                            onChange(false)
                            setIsOpen(false)
                        }}
                    >
                        Disable Confirmation Requirement
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}

export default ActionsPlatformTemplateConfirmation
