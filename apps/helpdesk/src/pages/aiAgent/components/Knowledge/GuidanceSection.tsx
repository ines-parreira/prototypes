import { history } from '@repo/routing'

import { LegacyIconButton as IconButton, Label } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'

import css from './GuidanceSection.less'

type Props = {
    shopName: string
    helpCenterId: number
}

export const GuidanceSection = ({ shopName, helpCenterId }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const onGuidanceTabRedirect = () => {
        history.push(routes.guidance)
    }

    const { guidanceUsed } = useGuidanceAiSuggestions({
        helpCenterId,
        shopName,
    })

    return (
        <>
            <div className={css.label}>
                <Label>Guidance</Label>
                <span className={css.description}>
                    Instruct AI Agent using internal-facing Guidance to handle
                    customer inquiries and follow end-to-end processes in line
                    with your company policies.
                </span>
            </div>
            <div className={css.content}>
                <div className={css.contentLabel}>
                    <span className={css.icon}>
                        <i className="material-icons">map</i>
                    </span>
                    {`${guidanceUsed.length} Guidance in use`}
                </div>
                <IconButton
                    size="small"
                    fillStyle="ghost"
                    intent="secondary"
                    aria-label="Navigate to Guidance tab"
                    onClick={onGuidanceTabRedirect}
                    icon="keyboard_arrow_right"
                />
            </div>
        </>
    )
}
