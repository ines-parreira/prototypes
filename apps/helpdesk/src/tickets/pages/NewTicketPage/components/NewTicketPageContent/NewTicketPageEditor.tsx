import { useMemo } from 'react'

import type { ListMacrosParams } from '@gorgias/helpdesk-queries'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { EditorContainer } from 'pages/common/editor/components/EditorContainer'
import { EditorForm } from 'pages/common/editor/components/EditorForm'
import { EditorReplyChannelContainer } from 'pages/common/editor/components/EditorReplyChannelContainer'
import useForm from 'pages/common/editor/hooks/useForm'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import useMacros from 'pages/common/editor/hooks/useMacros'
import useMacrosSearch from 'pages/common/editor/hooks/useMacrosSearch'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import ChannelSelect from 'pages/tickets/detail/components/ReplyArea/ChannelSelect'
import MessageSourceFields from 'pages/tickets/detail/components/ReplyArea/MessageSourceFields/MessageSourceFields'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import WhatsAppMessageTemplateReplyArea from 'pages/tickets/detail/components/ReplyArea/WhatsAppTemplateReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import type { Receiver } from 'state/ticket/utils'
import { NewTicketSubmitButtons } from 'tickets/pages/NewTicketPage/components/NewTicketSubmitButtons'

import css from './NewTicketPageContent.less'

type Filters = Pick<
    ListMacrosParams,
    'languages' | 'tags' | 'search' | 'cursor'
>

type NewTicketPageEditorProps = {
    submit: (args: SubmitArgs) => any
    subject: string
    onRecipientsChange: (prop: string, recipients: Receiver[]) => void
}

export function NewTicketPageEditor({
    submit,
    subject,
    onRecipientsChange,
}: NewTicketPageEditorProps) {
    const initialMacroFilters = useInitialMacroFilters()
    const { showWhatsAppTemplateEditor } = useWhatsAppEditor()

    const { hasAccess } = useAiAgentAccess()

    const { formRef, onSubmit } = useForm(submit)
    const {
        hasShown,
        filters,
        isActive,
        query,
        onChangeActive,
        onChangeFilters,
        onChangeQuery,
    } = useMacros({ initialFilters: initialMacroFilters })

    const params: Filters = useMemo(
        () => ({ ...filters, search: query }),
        [filters, query],
    )

    const { data, fetchNextPage, isLoading, nextCursor } = useMacrosSearch({
        params,
    })
    return (
        <EditorContainer className={css.editor}>
            <EditorForm ref={formRef} onSubmit={onSubmit}>
                <EditorReplyChannelContainer>
                    <ChannelSelect />
                    <MessageSourceFields
                        onRecipientsChange={onRecipientsChange}
                    />
                </EditorReplyChannelContainer>
                <ReplyForm>
                    {showWhatsAppTemplateEditor && (
                        <WhatsAppMessageTemplateReplyArea />
                    )}
                    {!showWhatsAppTemplateEditor && (
                        <TicketReplyArea
                            hasShownMacros={hasShown}
                            hasAutomate={hasAccess}
                            filters={filters}
                            isMacrosLoading={isLoading}
                            isMacrosActive={isActive}
                            loadMacros={fetchNextPage}
                            macros={data}
                            nextCursor={nextCursor ?? undefined}
                            query={query}
                            onChangeFilters={onChangeFilters}
                            onChangeMacrosActive={onChangeActive}
                            onChangeQuery={onChangeQuery}
                        />
                    )}
                    <NewTicketSubmitButtons subject={subject} submit={submit} />
                </ReplyForm>
            </EditorForm>
        </EditorContainer>
    )
}
