import {
    CheckBoxField,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { ApiIntent } from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal'

import css from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal.less'

type Props = {
    intent: ApiIntent
    groupName: string
    isChecked: boolean
    onToggle: (intent: ApiIntent) => void
    guidanceEditRoute: (articleId: number) => string
}

export const IntentRow = ({
    intent,
    groupName,
    isChecked,
    onToggle,
    guidanceEditRoute,
}: Props) => {
    const isLinkedElsewhere = !intent.is_available && !!intent.used_by_article

    const checkboxField = (
        <CheckBoxField
            label={`${groupName}/${intent.name.toLowerCase()}`}
            caption={
                isLinkedElsewhere
                    ? 'Already linked to another guidance'
                    : undefined
            }
            value={isChecked}
            onChange={() => onToggle(intent)}
            isDisabled={!intent.is_available}
        />
    )

    return (
        <div className={css.intentRow}>
            {isLinkedElsewhere ? (
                <Tooltip placement="bottom">
                    <TooltipTrigger>
                        <div className={css.intentRowTooltipTrigger}>
                            {checkboxField}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className={css.linkedElsewhereTooltip}>
                            <Text
                                size="sm"
                                className={css.linkedElsewhereTooltipText}
                            >
                                This intent is already linked to another
                                guidance. Unlink it there to assign it here.
                            </Text>
                            <a
                                href={guidanceEditRoute(
                                    intent.used_by_article!.id,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={css.linkedElsewhereTooltipLink}
                            >
                                See guidance
                                <Icon name="external-link" size="sm" />
                            </a>
                        </div>
                    </TooltipContent>
                </Tooltip>
            ) : (
                checkboxField
            )}
        </div>
    )
}
