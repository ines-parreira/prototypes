import type { ReactNode } from 'react'
import React from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import css from './AutomateViewContent.less'

type Props = {
    description?: ReactNode
    helpUrl?: string
    helpTitle?: string
    onSubmit?: () => void
    onCancel?: () => void
    isSubmittable?: boolean
    isCancelable?: boolean
    extraButtons?: ReactNode
    children: ReactNode
}

const AutomateViewContent = ({
    description,
    helpUrl,
    helpTitle,
    onSubmit,
    onCancel,
    isSubmittable = false,
    isCancelable = false,
    extraButtons,
    children,
}: Props) => {
    return (
        <div className={css.container}>
            {description && (
                <div className={css.description}>
                    {description}
                    {helpUrl && helpTitle && (
                        <a
                            href={helpUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <i className="material-icons mr-2">menu_book</i>
                            {helpTitle}
                        </a>
                    )}
                </div>
            )}
            {children}
            {onSubmit && onCancel && (
                <div className={css.buttons}>
                    <Button isDisabled={!isSubmittable} onClick={onSubmit}>
                        Save changes
                    </Button>
                    <Button
                        isDisabled={!isCancelable}
                        onClick={onCancel}
                        intent="secondary"
                    >
                        Cancel
                    </Button>
                    {extraButtons}
                </div>
            )}
            {onSubmit && (
                <UnsavedChangesPrompt onSave={onSubmit} when={isSubmittable} />
            )}
        </div>
    )
}

export default AutomateViewContent
