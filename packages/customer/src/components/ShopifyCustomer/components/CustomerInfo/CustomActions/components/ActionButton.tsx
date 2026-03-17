import { useState } from 'react'

import { Button } from '@gorgias/axiom'

import { useExecuteCustomAction } from '../../../../hooks'
import type { ButtonAction, ButtonConfig } from '../utils/customActionTypes'
import { ActionEditorDialog, hasEditableParameters } from './ActionEditorDialog'
import { useTemplateResolver } from './TemplateResolverContext'

function safeParseResolvedJson(
    json: Record<string, unknown> | string,
    resolve: (
        template: string,
        options?: { keepTemplateWhenEmpty?: boolean },
    ) => string,
): Record<string, unknown> | string {
    try {
        return JSON.parse(
            resolve(JSON.stringify(json), { keepTemplateWhenEmpty: true }),
        )
    } catch {
        return json
    }
}

export type ActionButtonProps = {
    config: ButtonConfig
    integrationId?: number
    customerId?: number
    ticketId?: string
}

export function ActionButton({
    config,
    integrationId,
    customerId,
    ticketId,
}: ActionButtonProps) {
    const resolve = useTemplateResolver()
    const { mutate, isLoading } = useExecuteCustomAction()
    const [isEditorOpen, setIsEditorOpen] = useState(false)

    const keepTemplate = { keepTemplateWhenEmpty: true } as const

    const executeResolvedAction = (action: ButtonAction) => {
        const resolvedAction = {
            ...action,
            url: resolve(action.url, keepTemplate),
            headers: action.headers.map((h) => ({
                ...h,
                value: resolve(h.value, keepTemplate),
            })),
            params: action.params.map((p) => ({
                ...p,
                value: resolve(p.value, keepTemplate),
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
                    value: resolve(p.value, keepTemplate),
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
                variant="secondary"
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
