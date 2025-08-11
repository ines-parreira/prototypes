import React, { useCallback, useMemo } from 'react'

import { Label } from '@gorgias/axiom'

import { useTranslationsPreviewContext } from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { OrderSelectionNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { MessageContent } from 'pages/automate/workflows/models/workflowConfiguration.types'
import { Drawer } from 'pages/common/components/Drawer'
import Caption from 'pages/common/forms/Caption/Caption'

import MessageContentFormField from '../components/MessageContentFormField'
import SupportedChannelsWarning from '../components/SupportedChannelsWarning'
import TranslationsPreviewField from '../components/translations/TranslationPreviewField'
import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function OrderSelectionEditor({
    nodeInEdition,
}: {
    nodeInEdition: OrderSelectionNodeType
}) {
    const { dispatch, getVariableListForNode } = useVisualBuilderContext()
    const { previewLanguage } = useTranslationsPreviewContext()
    const handleUpdateContent = useCallback(
        (content: MessageContent) => {
            dispatch({
                type: 'SET_ORDER_SELECTION_CONTENT',
                orderSelectionNodeId: nodeInEdition.id,
                content,
            })
        },
        [dispatch, nodeInEdition.id],
    )
    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id],
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <SupportedChannelsWarning nodeType={nodeInEdition.type} />
                    <div className={css.formField}>
                        <Label isRequired>Message</Label>
                        <div>
                            <MessageContentFormField
                                content={nodeInEdition.data.content}
                                handleUpdateContent={handleUpdateContent}
                                workflowVariables={workflowVariables}
                                onBlur={() => {
                                    dispatch({
                                        type: 'SET_TOUCHED',
                                        nodeId: nodeInEdition.id,
                                        touched: {
                                            content: true,
                                        },
                                    })
                                }}
                            />
                            <Caption error={nodeInEdition.data.errors?.content}>
                                Prompt customers to select an order. Customers
                                will be required to authenticate to see past
                                orders.
                            </Caption>
                        </div>
                    </div>
                    {previewLanguage && (
                        <>
                            <TranslationPreviewHeader />
                            <div className={css.formField}>
                                <Label className={css.labelDisabled}>
                                    Message
                                </Label>
                                <TranslationsPreviewField
                                    nodeId={nodeInEdition.id}
                                    tkey={
                                        nodeInEdition.data.content.text_tkey ??
                                        ''
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>
            </Drawer.Content>
        </>
    )
}
