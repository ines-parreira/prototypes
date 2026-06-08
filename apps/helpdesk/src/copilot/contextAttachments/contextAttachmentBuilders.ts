import type { ContextAttachment } from '@gorgias/copilot'

type TicketAttachmentInput = {
    id: number | undefined
    subject: string | undefined
    routeTicketId: number | undefined
}

type HelpCenterAttachmentInput = {
    id: number | undefined
    title: string | undefined
    helpCenterId: number | undefined
}

export function buildTicketContextAttachment({
    id,
    routeTicketId,
    subject,
}: TicketAttachmentInput): ContextAttachment | undefined {
    const attachmentId = toPositiveIdString(id)

    if (!attachmentId || !routeTicketId || id !== routeTicketId) {
        return undefined
    }

    return {
        kind: 'ticket',
        id: attachmentId,
        title: subject?.trim() || `Ticket #${attachmentId}`,
    }
}

export function buildGuidanceContextAttachment({
    id,
    title,
    helpCenterId,
}: HelpCenterAttachmentInput): ContextAttachment | undefined {
    return buildHelpCenterContextAttachment({
        kind: 'guidance',
        id,
        title,
        helpCenterId,
        fallbackTitle: 'Guidance',
    })
}

export function buildSkillContextAttachment({
    id,
    title,
    helpCenterId,
}: HelpCenterAttachmentInput): ContextAttachment | undefined {
    return buildHelpCenterContextAttachment({
        kind: 'skill',
        id,
        title,
        helpCenterId,
        fallbackTitle: 'Skill',
    })
}

function buildHelpCenterContextAttachment({
    fallbackTitle,
    helpCenterId,
    id,
    kind,
    title,
}: HelpCenterAttachmentInput & {
    fallbackTitle: string
    kind: 'guidance' | 'skill'
}): ContextAttachment | undefined {
    const attachmentId = toPositiveIdString(id)
    const attachmentHelpCenterId = toPositiveIdString(helpCenterId)

    if (!attachmentId || !attachmentHelpCenterId) {
        return undefined
    }

    return {
        kind,
        id: attachmentId,
        title: title?.trim() || `${fallbackTitle} #${attachmentId}`,
        helpCenterId: attachmentHelpCenterId,
    }
}

function toPositiveIdString(id: number | undefined): string | undefined {
    if (!id || !Number.isInteger(id) || id < 1) {
        return undefined
    }

    return String(id)
}
