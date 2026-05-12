import { useMemo, useState } from 'react'

import {
    Box,
    Button,
    Icon,
    Modal,
    OverlayContent,
    OverlayHeader,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { BaseIntegration } from '@gorgias/helpdesk-queries'

import type { TicketThreadActionExecutedEventItem as TicketThreadActionExecutedEventItemType } from '../../../../hooks/events/types'
import { TicketThreadEventAuthor } from '../TicketThreadEventAuthor'
import { TicketThreadEventContainer } from '../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../TicketThreadEventDateTime'
import { EntryRow } from './EntryRow'
import { HttpActionSection } from './HttpActionSection'
import {
    getActionExecutedErrorMessage,
    getActionExecutedLabel,
    getActionExecutedOrderToken,
    getActionExecutedPayloadEntries,
    getActionExecutedSourceFamily,
    getActionExecutedSourceIconName,
    getHttpActionModalSections,
} from './transforms'

import css from './TicketThreadActionExecutedEvent.less'

type TicketThreadActionExecutedEventProps = {
    item: TicketThreadActionExecutedEventItemType
    integration: BaseIntegration
}

export function TicketThreadActionExecutedEvent({
    integration,
    item,
}: TicketThreadActionExecutedEventProps) {
    const event = item.data
    const eventData = event.data

    const [isModalOpen, setIsModalOpen] = useState(false)

    const sourceFamily = getActionExecutedSourceFamily({
        actionName: eventData.action_name,
        integrationType: integration?.type,
    })
    const sourceIconName = getActionExecutedSourceIconName(sourceFamily)
    const actionLabel = getActionExecutedLabel({
        actionName: eventData.action_name,
        actionLabel: eventData.action_label,
    })
    const orderToken = getActionExecutedOrderToken({
        sourceFamily,
        payload: eventData.payload,
        integration,
    })
    const errorMessage = getActionExecutedErrorMessage({
        status: eventData.status,
        message: eventData.msg,
    })

    const isCustomHttp = eventData.action_name === 'customHttpAction'

    const httpSections = useMemo(
        () =>
            isCustomHttp ? getHttpActionModalSections(eventData.payload) : null,
        [isCustomHttp, eventData.payload],
    )

    const payloadEntries = useMemo(
        () =>
            !isCustomHttp
                ? getActionExecutedPayloadEntries(eventData.payload)
                : [],
        [isCustomHttp, eventData.payload],
    )

    const hasDetails = Boolean(
        errorMessage ||
        (httpSections != null
            ? httpSections.length > 0
            : payloadEntries.length > 0),
    )

    const modalTitle = isCustomHttp ? 'Request' : 'Action details'

    return (
        <TicketThreadEventContainer>
            <Icon name={sourceIconName} />
            <Text size="sm">{actionLabel}</Text>
            {orderToken &&
                (orderToken.href ? (
                    <a
                        href={orderToken.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Text size="sm">{orderToken.label}</Text>
                    </a>
                ) : (
                    <Text size="sm" variant="medium">
                        {orderToken.label}
                    </Text>
                ))}
            {integration?.name && <Text size="sm"> on {integration.name}</Text>}
            {event.user_id != null && (
                <TicketThreadEventAuthor authorId={event.user_id} />
            )}
            {hasDetails && (
                <>
                    <Tooltip
                        trigger={
                            <Button
                                variant="tertiary"
                                size="sm"
                                aria-label="Show action details"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Icon name="info" />
                            </Button>
                        }
                    >
                        <TooltipContent>
                            <Box flexDirection="column" gap="xxxs">
                                <Text size="sm" variant="medium">
                                    {errorMessage
                                        ? 'Action failed'
                                        : 'Action succeeded'}
                                </Text>
                                <Text size="sm">Click for more details</Text>
                            </Box>
                        </TooltipContent>
                    </Tooltip>
                    <Modal
                        isOpen={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        isDismissable
                    >
                        <OverlayHeader title={modalTitle} />
                        <OverlayContent flexDirection="column">
                            {errorMessage && (
                                <div className={css.error}>
                                    <Text size="sm" variant="medium">
                                        Error:
                                    </Text>{' '}
                                    <Text size="sm">{errorMessage}</Text>
                                </div>
                            )}
                            {httpSections
                                ? httpSections.map((section) => (
                                      <HttpActionSection
                                          key={section.title || 'url'}
                                          section={section}
                                      />
                                  ))
                                : payloadEntries.map((entry) => (
                                      <div
                                          key={`${entry.key}-${entry.value}`}
                                          className={css.entry}
                                      >
                                          <EntryRow entry={entry} />
                                      </div>
                                  ))}
                        </OverlayContent>
                    </Modal>
                </>
            )}
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
