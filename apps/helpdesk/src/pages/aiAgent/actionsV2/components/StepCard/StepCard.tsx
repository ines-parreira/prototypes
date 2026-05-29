import type { CSSProperties, HTMLAttributes, MouseEvent, Ref } from 'react'

import classNames from 'classnames'

import { Button, Icon, Text } from '@gorgias/axiom'

import { ProviderIcon } from '../../sidePanel/shared/ProviderIcon'

import css from './StepCard.less'

export type StepCardProps = {
    appName: string
    appIconUrl?: string
    stepName: string
    onDelete: () => void
    onClick?: () => void
    deleteLabel?: string
    dragHandleLabel?: string
    dragHandleProps?: HTMLAttributes<HTMLButtonElement>
    dragHandleRef?: Ref<HTMLButtonElement>
    rowRef?: Ref<HTMLDivElement>
    rowStyle?: CSSProperties
    rowDataHandlerId?: string | symbol | null
}

export const StepCard = ({
    appName,
    appIconUrl,
    stepName,
    onDelete,
    onClick,
    deleteLabel,
    dragHandleLabel = 'Reorder step',
    dragHandleProps,
    dragHandleRef,
    rowRef,
    rowStyle,
    rowDataHandlerId,
}: StepCardProps) => {
    const deleteAriaLabel = deleteLabel ?? `Delete ${stepName} step`
    const isInteractive = Boolean(onClick)

    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        onDelete()
    }

    const interactiveProps = isInteractive
        ? {
              role: 'button',
              tabIndex: 0,
              onClick,
              onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onClick?.()
                  }
              },
          }
        : { role: 'group' as const }

    return (
        <div
            ref={rowRef}
            aria-label={`${appName} — ${stepName}`}
            data-handler-id={rowDataHandlerId ?? undefined}
            style={rowStyle}
            className={classNames(css.row, isInteractive && css.interactive)}
            {...interactiveProps}
        >
            <button
                type="button"
                ref={dragHandleRef}
                aria-label={dragHandleLabel}
                className={css.dragHandle}
                onClick={(event) => event.stopPropagation()}
                {...dragHandleProps}
            >
                <Icon name="grip" />
            </button>

            <div className={css.field}>
                {appIconUrl ? (
                    <ProviderIcon
                        iconUrl={appIconUrl}
                        size="sm"
                        className={css.fieldIcon}
                    />
                ) : null}
                <Text className={css.fieldText}>{appName}</Text>
            </div>

            <div className={css.field}>
                <Text className={css.fieldText}>{stepName}</Text>
            </div>

            <Button
                variant="tertiary"
                intent="destructive"
                aria-label={deleteAriaLabel}
                onClick={handleDelete}
                icon={<Icon name="close" size="sm" />}
            />
        </div>
    )
}
