import { useEffect, useMemo, useRef } from 'react'

import { useKey, usePrevious } from '@repo/hooks'
import classNames from 'classnames'
import _camelCase from 'lodash/camelCase'

import { TranslationsPreviewProvider } from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import { VisualBuilderNode } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'

import AutomatedMessageEditor from './editors/AutomatedMessageEditor'
import CancelSubscriptionEditor from './editors/CancelSubscriptionEditor'
import ChannelTriggerEditor from './editors/ChannelTriggerEditor'
import ConditionsNodeEditor from './editors/ConditionsNodeEditor/ConditionsNodeEditor'
import EndNodeEditor from './editors/EndNodeEditor'
import FileUploadEditor from './editors/FileUploadEditor'
import HttpRequestEditor from './editors/HttpRequestEditor'
import LiquidTemplateEditor from './editors/LiquidTemplateEditor'
import LLMPromptTriggerEditor from './editors/LLMPromptTriggerEditor'
import MultipleChoicesEditor from './editors/MultipleChoicesEditor'
import OrderLineItemSelectionEditor from './editors/OrderLineItemSelectionEditor'
import OrderSelectionEditor from './editors/OrderSelectionEditor'
import RemoveItemEditor from './editors/RemoveItemEditor'
import ReplaceItemEditor from './editors/ReplaceItemEditor'
import ReusableLLMPromptCallEditor from './editors/ReusableLLMPromptCallEditor'
import ReusableLLMPromptTriggerEditor from './editors/ReusableLLMPromptTriggerEditor'
import ShopperAuthenticationEditor from './editors/ShopperAuthenticationEditor/ShopperAuthenticationEditor'
import SkipChargeEditor from './editors/SkipChargeEditor'
import TextReplyEditor from './editors/TextReplyEditor'
import UpdateShippingAddressEditor from './editors/UpdateShippingAddressEditor'
import NodeEditorDrawerContext, {
    NodeEditorDrawerContextType,
} from './NodeEditorDrawerContext'

import css from './NodeEditorDrawer.less'

type Props = {
    nodeInEdition?: VisualBuilderNode | null
    onClose: () => void
}

const NodeEditorDrawer = ({ nodeInEdition, onClose }: Props) => {
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
        [nodeInEdition, onClose],
    )

    const memoizedNodeInEdition = memoizedNodeInEditionRef.current

    const contextValue = useMemo<NodeEditorDrawerContextType>(
        () => ({ onClose }),
        [onClose],
    )

    return (
        <Drawer
            className={classNames(
                css.drawer,
                memoizedNodeInEdition
                    ? css[_camelCase(memoizedNodeInEdition.type)]
                    : undefined,
            )}
            data-testid="visual-builder-node-edition" // used in e2e tests
            aria-label="Node editor"
            open={!!nodeInEdition}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
            containerZIndices={[10, 10]}
            showBackdrop={false}
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
                {memoizedNodeInEdition?.type === 'liquid_template' && (
                    <LiquidTemplateEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
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
                {memoizedNodeInEdition?.type === 'replace_item' && (
                    <ReplaceItemEditor nodeInEdition={memoizedNodeInEdition} />
                )}
                {memoizedNodeInEdition?.type === 'cancel_subscription' && (
                    <CancelSubscriptionEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
                {memoizedNodeInEdition?.type === 'skip_charge' && (
                    <SkipChargeEditor nodeInEdition={memoizedNodeInEdition} />
                )}
                {memoizedNodeInEdition?.type ===
                    'reusable_llm_prompt_trigger' && (
                    <ReusableLLMPromptTriggerEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
                {memoizedNodeInEdition?.type === 'reusable_llm_prompt_call' && (
                    <ReusableLLMPromptCallEditor
                        nodeInEdition={memoizedNodeInEdition}
                    />
                )}
            </NodeEditorDrawerContext.Provider>
        </Drawer>
    )
}

export default NodeEditorDrawer
