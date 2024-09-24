import React, {useEffect, useMemo, useRef} from 'react'
import classNames from 'classnames'
import _camelCase from 'lodash/camelCase'

import {Drawer} from 'pages/common/components/Drawer'
import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {TranslationsPreviewProvider} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import usePrevious from 'hooks/usePrevious'
import useKey from 'hooks/useKey'

import css from './NodeEditorDrawer.less'
import ChannelTriggerEditor from './editors/ChannelTriggerEditor'
import MultipleChoicesEditor from './editors/MultipleChoicesEditor'
import AutomatedMessageEditor from './editors/AutomatedMessageEditor'
import TextReplyEditor from './editors/TextReplyEditor'
import FileUploadEditor from './editors/FileUploadEditor'
import EndNodeEditor from './editors/EndNodeEditor'
import OrderSelectionEditor from './editors/OrderSelectionEditor'
import HttpRequestEditor from './editors/HttpRequestEditor'
import NodeEditorDrawerContext, {
    NodeEditorDrawerContextType,
} from './NodeEditorDrawerContext'
import ShopperAuthenticationEditor from './editors/ShopperAuthenticationEditor/ShopperAuthenticationEditor'
import ConditionsNodeEditor from './editors/ConditionsNodeEditor/ConditionsNodeEditor'
import OrderLineItemSelectionEditor from './editors/OrderLineItemSelectionEditor'
import LLMPromptTriggerEditor from './editors/LLMPromptTriggerEditor'
import UpdateShippingAddressEditor from './editors/UpdateShippingAddressEditor'
import CancelSubscriptionEditor from './editors/CancelSubscriptionEditor'
import SkipChargeEditor from './editors/SkipChargeEditor'
import RemoveItemEditor from './editors/RemoveItemEditor'

type Props = {
    nodeInEdition?: VisualBuilderNode | null
    onClose: () => void
}

const NodeEditorDrawer = ({nodeInEdition, onClose}: Props) => {
    const memoizedNodeInEditionRef = useRef(nodeInEdition)
    const prevNodeInEdition = usePrevious(nodeInEdition)

    if (nodeInEdition) {
        memoizedNodeInEditionRef.current = nodeInEdition
    }

    useEffect(() => {
        if (prevNodeInEdition && !nodeInEdition) {
            onClose()
        }
    }, [prevNodeInEdition, nodeInEdition, onClose])

    useKey(
        'Escape',
        () => {
            if (nodeInEdition) {
                onClose()
            }
        },
        undefined,
        [nodeInEdition, onClose]
    )

    const memoizedNodeInEdition = memoizedNodeInEditionRef.current

    const contextValue = useMemo<NodeEditorDrawerContextType>(
        () => ({onClose}),
        [onClose]
    )

    return (
        <Drawer
            className={classNames(
                css.drawer,
                memoizedNodeInEdition
                    ? css[_camelCase(memoizedNodeInEdition.type)]
                    : undefined
            )}
            name="visual-builder-node-edition"
            open={!!nodeInEdition}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
        >
            <NodeEditorDrawerContext.Provider
                key={nodeInEdition?.id}
                value={contextValue}
            >
                {memoizedNodeInEdition?.type === 'channel_trigger' && (
                    <TranslationsPreviewProvider>
                        <ChannelTriggerEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    </TranslationsPreviewProvider>
                )}
                {memoizedNodeInEdition?.type === 'automated_message' && (
                    <TranslationsPreviewProvider>
                        <AutomatedMessageEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    </TranslationsPreviewProvider>
                )}
                {memoizedNodeInEdition?.type === 'multiple_choices' && (
                    <TranslationsPreviewProvider>
                        <MultipleChoicesEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    </TranslationsPreviewProvider>
                )}
                {memoizedNodeInEdition?.type === 'text_reply' && (
                    <TranslationsPreviewProvider>
                        <TextReplyEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    </TranslationsPreviewProvider>
                )}
                {memoizedNodeInEdition?.type === 'file_upload' && (
                    <TranslationsPreviewProvider>
                        <FileUploadEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    </TranslationsPreviewProvider>
                )}
                {memoizedNodeInEdition?.type === 'order_selection' && (
                    <TranslationsPreviewProvider>
                        <OrderSelectionEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    </TranslationsPreviewProvider>
                )}
                {memoizedNodeInEdition?.type === 'shopper_authentication' && (
                    <ShopperAuthenticationEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
                {memoizedNodeInEdition?.type === 'http_request' && (
                    <HttpRequestEditor nodeInEdition={memoizedNodeInEdition} />
                )}
                {memoizedNodeInEdition?.type === 'conditions' && (
                    <ConditionsNodeEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
                {memoizedNodeInEdition?.type ===
                    'order_line_item_selection' && (
                    <TranslationsPreviewProvider>
                        <OrderLineItemSelectionEditor
                            nodeInEdition={memoizedNodeInEdition}
                        />
                    </TranslationsPreviewProvider>
                )}
                {memoizedNodeInEdition?.type === 'end' && (
                    <EndNodeEditor nodeInEdition={memoizedNodeInEdition} />
                )}
                {memoizedNodeInEdition?.type === 'llm_prompt_trigger' && (
                    <LLMPromptTriggerEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
                {memoizedNodeInEdition?.type === 'update_shipping_address' && (
                    <UpdateShippingAddressEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
                {memoizedNodeInEdition?.type === 'remove_item' && (
                    <RemoveItemEditor nodeInEdition={memoizedNodeInEdition} />
                )}
                {memoizedNodeInEdition?.type === 'cancel_subscription' && (
                    <CancelSubscriptionEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
                {memoizedNodeInEdition?.type === 'skip_charge' && (
                    <SkipChargeEditor nodeInEdition={memoizedNodeInEdition} />
                )}
            </NodeEditorDrawerContext.Provider>
        </Drawer>
    )
}

export default NodeEditorDrawer
