import classnames from 'classnames'
import { UncontrolledTooltip } from 'reactstrap'

import type { Macro } from '@gorgias/helpdesk-queries'

import { useStandaloneAiContext } from '../../../../../../providers/standalone-ai/StandaloneAiContext'
import { MacroButton } from './MacroButton'

import css from './MacrosQuickReply.less'

type Props = {
    macros: Macro[]
    applyMacro: (macro: Macro) => void
}

export const MacrosQuickReply = ({ macros, applyMacro }: Props) => {
    const { isStandaloneAiAgent } = useStandaloneAiContext()

    if (isStandaloneAiAgent) {
        return null
    }

    return (
        <div className={css.wrapper}>
            <div className={css.info}>
                <UncontrolledTooltip target="macro-suggestion-info">
                    <div className={css.tooltip}>
                        Macros are suggested based on your previous macro usage.
                        Use macros to save time answering tickets.
                    </div>
                </UncontrolledTooltip>
                <i
                    className={classnames('material-icons', 'mr-2')}
                    id="macro-suggestion-info"
                >
                    info_outline
                </i>
                Suggested macros
            </div>
            <div className={css.macros}>
                {macros
                    .filter((macro) => macro?.id)
                    .map((macro) => (
                        <MacroButton
                            macro={macro}
                            applyMacro={() => {
                                void applyMacro(macro)
                            }}
                            key={macro.id}
                        />
                    ))}
            </div>
        </div>
    )
}
