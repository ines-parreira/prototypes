import { useMemo } from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { LiquidTemplateNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'
import Caption from 'pages/common/forms/Caption/Caption'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import TextareaWithVariables from '../../components/variables/TextareaWithVariables'
import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'

import css from '../NodeEditor.less'

export default function LiquidTemplateEditor({
    nodeInEdition,
}: {
    nodeInEdition: LiquidTemplateNodeType
}) {
    const { dispatch, getVariableListForNode } = useVisualBuilderContext()

    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id],
    )

    return (
        <>
            <NodeEditorDrawerHeader
                nodeInEdition={nodeInEdition}
            ></NodeEditorDrawerHeader>
            <Drawer.Content>
                <div className={css.container}>
                    {/* TODO: Style this */}
                    <div>
                        <p>
                            Write a Liquid template to generate a variable for
                            use in subsequent steps.
                        </p>
                        <a
                            href="https://shopify.github.io/liquid/basics/introduction/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#0070f3',
                                textDecoration: 'underline',
                            }}
                        >
                            Common Liquid Examples
                        </a>
                    </div>
                    <div className={css.formField}>
                        <Label isRequired>Request name</Label>
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
                    <div className={css.formField}>
                        <div>
                            <Label>Output variables</Label>
                            <Caption>
                                Create variables from the request response which
                                can be used in subsequent steps
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
        </>
    )
}
