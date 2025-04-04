import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import css from './VoiceSettingAccordionItem.less'

type Props = {
    children: React.ReactNode
    subtitle: React.ReactNode
    description: React.ReactNode
}

export default function VoiceSettingAccordionItem({
    children,
    subtitle,
    description,
}: Props) {
    return (
        <div>
            <AccordionItem>
                <AccordionHeader>
                    <div className={css.accordionHeader}>
                        <div className={css.subtitle}>{subtitle}</div>
                        <div>{description}</div>
                    </div>
                </AccordionHeader>
                <AccordionBody>{children}</AccordionBody>
            </AccordionItem>
        </div>
    )
}
