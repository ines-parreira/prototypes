import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import { TransitionsState } from '../types'

import css from './TransitionConditionsAccordion.less'

const TransitionConditionsAccordion = ({
    transition,
}: {
    transition: TransitionsState
}) => {
    return (
        <AccordionItem
            id={`transition-${transition.from_step_id}-${transition.to_step_id}`}
            highlightOnExpand={false}
        >
            <AccordionHeader>
                <div className={css.title}>
                    <i className="material-icons">call_split</i>
                    <p>Route customers using variables</p>
                </div>
            </AccordionHeader>
            <AccordionBody>
                <div className={css.body}>
                    <p>Branch taken: {transition.name ?? 'Unnamed Branch'}</p>
                    <p>Details</p>
                    <pre className={css.codeBlock}>
                        {JSON.stringify(transition, null, 2)}
                    </pre>
                </div>
            </AccordionBody>
        </AccordionItem>
    )
}

export default TransitionConditionsAccordion
