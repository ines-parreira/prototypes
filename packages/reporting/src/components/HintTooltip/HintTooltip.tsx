import { TooltipData } from '../../types'

export const HintTooltip = ({ hint }: { hint: TooltipData }) => {
    return (
        <>
            {hint.title}
            {hint.title !== '' && <br />}
            {hint.link && (
                <a href={hint.link} target="_blank" rel="noopener noreferrer">
                    {hint.linkText}
                </a>
            )}
        </>
    )
}
