import { useState } from 'react'

import { Box, Button } from '@gorgias/axiom'

import { useExecuteCustomAction } from '../../../../hooks'
import { useCustomActions } from '../hooks/useCustomActions'
import type { ButtonAction, ButtonConfig } from '../utils/customActionTypes'
import { ActionEditorDialog, hasEditableParameters } from './ActionEditorDialog'
import { useTemplateResolver } from './TemplateResolverContext'

function safeParseResolvedJson(
    json: Record<string, unknown> | string,
    resolve: (template: string) => string,
): Record<string, unknown> | string {
    try {
        return JSON.parse(resolve(JSON.stringify(json)))
    } catch {
        return json
    }
}

type CustomActionsProps = {
    integrationId?: number
    customerId?: number
    ticketId?: string
}

export function CustomActions({
    integrationId,
    customerId,
    ticketId,
}: CustomActionsProps) {
    const { links, buttons } = useCustomActions()
    const resolve = useTemplateResolver()

    if (links.length === 0 && buttons.length === 0) {
        return null
    }

    return (
        <Box flexWrap="wrap" gap="xxxs">
            {links.map((link) => (
                <Box key={`${link.label}-${link.url}`}>
                    <Button
                        as="a"
                        href={resolve(link.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        trailingSlot="external-link"
                        variant="tertiary"
                        size="sm"
                    >
                        {resolve(link.label)}
                    </Button>
                </Box>
            ))}
            {buttons.map((button) => (
                <Box key={`${button.label}-${button.action.url}`}>
                    <ActionButton
                        config={button}
                        integrationId={integrationId}
                        customerId={customerId}
                        ticketId={ticketId}
                    />
                </Box>
            ))}
        </Box>
    )
}

type ActionButtonProps = {
    config: ButtonConfig
    integrationId?: number
    customerId?: number
    ticketId?: string
}

function ActionButton({
    config,
    integrationId,
    customerId,
    ticketId,
}: ActionButtonProps) {
    const resolve = useTemplateResolver()
    const { mutate, isLoading } = useExecuteCustomAction()
    const [isEditorOpen, setIsEditorOpen] = useState(false)

    const executeResolvedAction = (action: ButtonAction) => {
        const resolvedAction = {
            ...action,
            url: resolve(action.url),
            headers: action.headers.map((h) => ({
                ...h,
                value: resolve(h.value),
            })),
            params: action.params.map((p) => ({
                ...p,
                value: resolve(p.value),
            })),
            body: {
                ...action.body,
                'application/json':
                    action.body.contentType === 'application/json'
                        ? safeParseResolvedJson(
                              action.body['application/json'],
                              resolve,
                          )
                        : action.body['application/json'],
                'application/x-www-form-urlencoded': action.body[
                    'application/x-www-form-urlencoded'
                ].map((p) => ({
                    ...p,
                    value: resolve(p.value),
                })),
            },
        }

        mutate({
            integrationId,
            customerId,
            ticketId,
            label: resolve(config.label),
            action: resolvedAction,
        })
    }

    const handleAction = () => {
        if (hasEditableParameters(config.action)) {
            setIsEditorOpen(true)
            return
        }
        executeResolvedAction(config.action)
    }

    const handleEditorExecute = (modifiedAction: ButtonAction) => {
        setIsEditorOpen(false)
        executeResolvedAction(modifiedAction)
    }

    return (
        <>
            <Button
                variant="tertiary"
                size="sm"
                onClick={handleAction}
                isDisabled={isLoading}
            >
                {resolve(config.label)}
            </Button>
            <ActionEditorDialog
                isOpen={isEditorOpen}
                onOpenChange={setIsEditorOpen}
                action={config.action}
                label={resolve(config.label)}
                onExecute={handleEditorExecute}
            />
        </>
    )
}
