import { useMemo, useState } from 'react'

import _uniq from 'lodash/uniq'

import { Label } from '@gorgias/axiom'

import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    extractVariablesFromNode,
    parseWorkflowVariable,
} from 'pages/automate/workflows/models/variables.model'
import { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'
import { LiquidTemplateNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Button from 'pages/common/components/button/Button'
import { Drawer } from 'pages/common/components/Drawer'
import Caption from 'pages/common/forms/Caption/Caption'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import TextareaWithVariables from '../../components/variables/TextareaWithVariables'
import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'
import TestLiquidTemplateModal from './TestLiquidTemplateModal'

import css from '../NodeEditor.less'
import liquidTemplateEditorCss from './LiquidTemplateEditor.less'

export default function LiquidTemplateEditor({
    nodeInEdition,
}: {
    nodeInEdition: LiquidTemplateNodeType
}) {
    const { dispatch, getVariableListForNode } = useVisualBuilderContext()
    const [isTestModalOpen, setIsTestModalOpen] = useState(false)

    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id],
    )

    const variables = useMemo(() => {
        const variables = _uniq(
            extractVariablesFromNode({
                type: 'liquid_template',
                data: nodeInEdition.data,
            }),
        )
        return variables.map((variable) =>
            parseWorkflowVariable(variable, workflowVariables),
        )
    }, [workflowVariables, nodeInEdition.data])

    return (
        <>
            <NodeEditorDrawerHeader
                nodeInEdition={nodeInEdition}
            ></NodeEditorDrawerHeader>
            <Drawer.Content>
                <div className={`${css.container}`}>
                    <div className={liquidTemplateEditorCss.description}>
                        <p>
                            Write a Liquid template to generate a variable for
                            use in subsequent steps.
                        </p>
                        <div
                            className={
                                liquidTemplateEditorCss.helpLinkContainer
                            }
                        >
                            <i className={`material-icons`}>menu_book</i>
                            <a
                                href="https://shopify.github.io/liquid/basics/introduction/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={liquidTemplateEditorCss.helpLink}
                            >
                                Common Liquid Examples
                            </a>
                        </div>
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Step name</Label>
                        <TextInput
                            className={css.textInput}
                            // ref={setInputRef}
                            isRequired
                            maxLength={100}
                            onChange={(name: string) => {
                                dispatch({
                                    type: 'SET_LIQUID_TEMPLATE_NAME',
                                    liquidTemplateNodeId: nodeInEdition.id,
                                    name,
                                })
                            }}
                            value={nodeInEdition.data.name}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        name: true,
                                    },
                                })
                            }}
                            hasError={!!nodeInEdition.data.errors?.name}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Template</Label>
                        <TextareaWithVariables
                            value={nodeInEdition.data.template}
                            onChange={(template: string) => {
                                dispatch({
                                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                                    liquidTemplateNodeId: nodeInEdition.id,
                                    template,
                                })
                            }}
                            variables={workflowVariables}
                            error={nodeInEdition.data.errors?.template}
                            onBlur={() => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        template: true,
                                    },
                                })
                            }}
                            isLiquidTemplate
                        />
                    </div>
                    <Button
                        className={css.testRequestButton}
                        onClick={() => {
                            setIsTestModalOpen(true)
                        }}
                        intent="secondary"
                    >
                        Test template
                    </Button>
                    <div className={css.formField}>
                        <div>
                            <Label>Output variable</Label>
                            <Caption>
                                The result of the template evaluation will be
                                available for use in subsequent steps. Specify
                                its data type.
                            </Caption>
                        </div>
                        <SelectField
                            showSelectedOption
                            value={nodeInEdition.data.output.data_type}
                            onChange={(type) => {
                                dispatch({
                                    type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                                    liquidTemplateNodeId: nodeInEdition.id,
                                    data_type: type as
                                        | 'string'
                                        | 'number'
                                        | 'boolean'
                                        | 'date',
                                })
                            }}
                            options={[
                                { label: 'String', value: 'string' },
                                { label: 'Number', value: 'number' },
                                { label: 'Boolean', value: 'boolean' },
                                { label: 'Date', value: 'date' },
                            ]}
                        />
                    </div>
                </div>
            </Drawer.Content>
            <TestLiquidTemplateModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                nodeInEdition={nodeInEdition}
                variables={variables.filter(
                    (variable): variable is WorkflowVariable =>
                        variable !== null,
                )}
            />
        </>
    )
}
