import { isRecord } from '@repo/utils'
import cn from 'classnames'

import type { IconName } from '@gorgias/axiom'
import {
    Box,
    Icon,
    Loader,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { TicketThreadEventContainer } from '../../TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventItem/components/TicketThreadEventDateTime'
import { AppliedTag } from './AppliedTag'

import css from './MessageAppliedActions.less'

type Action = NonNullable<TicketMessage['actions']>[number]

function getActionName(action: Action): string {
    return typeof action.name === 'string' ? action.name : ''
}

function getStatus(action: Action): string | null {
    return typeof action.status === 'string' ? action.status : null
}

function getActionTitle(action: Action): string {
    const name = getActionName(action)
    if (name === 'applyExternalTemplate') return 'WhatsApp template applied'
    return typeof action.title === 'string' ? action.title : name
}

function getSourceIconName(name: string): IconName {
    if (name.startsWith('shopify')) return 'app-shopify'
    if (name === 'http') return 'webhook'
    return 'check-circle'
}

function getTagNames(action: Action): string[] {
    if (!isRecord(action.arguments)) return []
    const tags = action.arguments.tags
    if (typeof tags !== 'string' || !tags) return []
    return tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
}

export type AppliedActionProps = {
    action: Action
    isPending: boolean
    ticketId: number
    createdDatetime: string | null | undefined
}

export function AppliedAction({
    action,
    isPending,
    ticketId,
    createdDatetime,
}: AppliedActionProps) {
    const name = getActionName(action)
    const status = getStatus(action)
    const isLoading = isPending || status === 'pending'

    if (name === 'addTags') {
        const tags = getTagNames(action)
        return (
            <TicketThreadEventContainer>
                {isLoading ? <Loader size="sm" /> : <Icon name="tag" />}
                <Box
                    flexDirection="row"
                    alignItems="center"
                    flexWrap="wrap"
                    gap="xxxs"
                    className={cn({ [css.dimmed]: isLoading })}
                >
                    {tags.map((tag) => (
                        <AppliedTag key={tag} name={tag} ticketId={ticketId} />
                    ))}
                </Box>
                <Text
                    size="sm"
                    className={cn({ [css.dimmed]: isLoading })}
                    color={
                        isLoading
                            ? 'var(--content-neutral-tertiary)'
                            : undefined
                    }
                >
                    {tags.length === 1 ? 'was' : 'were'} added via{' '}
                    <Text size="sm" variant="medium">
                        macro
                    </Text>
                </Text>
                {createdDatetime && (
                    <Box className={cn({ [css.dimmed]: isLoading })}>
                        <TicketThreadEventDateTime datetime={createdDatetime} />
                    </Box>
                )}
            </TicketThreadEventContainer>
        )
    }

    return (
        <TicketThreadEventContainer>
            {isLoading ? (
                <Loader size="sm" />
            ) : (
                <Icon name={getSourceIconName(name)} />
            )}
            <Text
                size="sm"
                color={
                    isLoading
                        ? 'var(--content-neutral-tertiary)'
                        : status === 'error' || status === 'cancelled'
                          ? 'var(--content-error-default)'
                          : undefined
                }
            >
                {getActionTitle(action)} via{' '}
                <Text size="sm" variant="medium">
                    macro
                </Text>
            </Text>
            {(status === 'error' || status === 'cancelled') && (
                <Tooltip
                    trigger={
                        <Icon
                            name="warning-triangle"
                            color="var(--content-error-default)"
                        />
                    }
                >
                    <TooltipContent title="Action failed." />
                </Tooltip>
            )}
            {createdDatetime && (
                <TicketThreadEventDateTime datetime={createdDatetime} />
            )}
        </TicketThreadEventContainer>
    )
}
