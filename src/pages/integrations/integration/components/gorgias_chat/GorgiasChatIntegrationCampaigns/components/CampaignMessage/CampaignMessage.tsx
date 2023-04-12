import React, {memo, useMemo} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'

import {EditorState} from 'draft-js'

import {User} from 'config/types/user'

import {AgentLabel} from 'pages/common/utils/labels'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {Option, Value} from 'pages/common/forms/SelectField/types'

import RichField from 'pages/common/forms/RichField/RichField'
import {useIsAllowedToAddDiscountCode} from '../../hooks/useIsAllowedToAddDiscountCode'

import css from './CampaignMessage.less'

type Props = {
    richAreaRef: (ref: RichField | null) => void
    agents: User[]
    attachments: List<any>
    html: string
    isRevenueBetaTester?: boolean
    text: string
    selectedAgent: string
    showContentWarning?: boolean
    onSelectAgent: (agent: Value) => void
    onChangeMessage: (value: EditorState) => void
    onDeleteAttachment: (index: number) => void
}

export const CampaignMessage = memo(
    ({
        richAreaRef,
        agents,
        attachments,
        html,
        isRevenueBetaTester = false,
        text,
        selectedAgent,
        showContentWarning,
        onSelectAgent,
        onChangeMessage,
        onDeleteAttachment,
    }: Props): JSX.Element => {
        const isAllowedToAddDiscountCode = useIsAllowedToAddDiscountCode()
        const options = useMemo<Option[]>(() => {
            const initialArr: Option[] = [
                {
                    value: '',
                    text: 'randomagent',
                    label: (
                        <AgentLabel
                            name={'Random agent'}
                            maxWidth="100"
                            shouldDisplayAvatar
                        />
                    ),
                },
            ]

            return agents.reduce((acc, agent) => {
                const props: Record<string, string> = {
                    name: agent.name,
                }

                if (agent.meta?.profile_picture_url) {
                    props['profilePictureUrl'] = agent.meta
                        .profile_picture_url as unknown as string
                }

                return [
                    ...acc,
                    {
                        label: <AgentLabel {...props} shouldDisplayAvatar />,
                        value: agent.email,
                        text: agent.name,
                    },
                ]
            }, initialArr)
        }, [agents])

        const value = useMemo(
            () => ({
                html,
                text,
            }),
            [html, text]
        )

        const displayedActions = useMemo(() => {
            const actions = [
                ActionName.Bold,
                ActionName.Italic,
                ActionName.Underline,
                ActionName.Link,
                ActionName.Image,
                ActionName.Emoji,
            ]

            if (isAllowedToAddDiscountCode) {
                actions.push(ActionName.DiscountCodePicker)
            }

            if (attachments.size < 5) {
                actions.push(ActionName.ProductPicker)
            }

            actions.push(ActionName.Video)

            return actions
        }, [attachments, isAllowedToAddDiscountCode])

        return (
            <div className="mb-4">
                <div
                    data-testid="campaign-agent-section"
                    className={classnames('mb-2', css.authorWrapper)}
                >
                    <span>From: </span>
                    <SelectField
                        className={css.authorInput}
                        value={selectedAgent}
                        options={options}
                        onChange={onSelectAgent}
                    />
                </div>
                {isRevenueBetaTester && showContentWarning && (
                    <div className="mb-4 mt-4">
                        <Alert icon type={AlertType.Warning}>
                            Your campaign might be too large for mobile devices
                            or small screens. We advise limiting the content to
                            maximum 170 characters and maximum 5 lines of text.
                        </Alert>
                    </div>
                )}
                <div className={css.textEditorWrapper}>
                    <TicketRichField
                        ref={(ref) => richAreaRef(ref)}
                        value={value}
                        attachments={attachments}
                        allowExternalChanges
                        disableProductCards={!isRevenueBetaTester}
                        onChange={onChangeMessage}
                        placeholder={'Write your message'}
                        displayedActions={displayedActions}
                        isRequired
                        countCharacters={isRevenueBetaTester}
                    />
                    <TicketAttachments
                        removable
                        attachments={attachments}
                        className="p-2 d-flex flex-wrap"
                        deleteAttachment={onDeleteAttachment}
                    />
                </div>
            </div>
        )
    }
)
