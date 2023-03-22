import React, {ReactNode} from 'react'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import css from './MigrationTutorialList.less'

type Instruction = {
    message: ReactNode
}

type Tutorial = {
    name: string
    icon: string
    helpDocsUrl: string
    instructions: Instruction[]
}

type Props = {
    description?: ReactNode
    footer?: ReactNode
    tutorials: Tutorial[]
}

export default function MigrationTutorialList({
    description,
    footer,
    tutorials,
}: Props) {
    return (
        <div className={css.container}>
            {description}
            <Accordion>
                {tutorials.map((tutorial) => (
                    <AccordionItem key={tutorial.name}>
                        <AccordionHeader>
                            <img
                                src={tutorial.icon}
                                alt={tutorial.name}
                                className={css.tutorialIcon}
                            />
                            {tutorial.name}
                        </AccordionHeader>
                        <AccordionBody>
                            <ul>
                                {tutorial.instructions.map(
                                    (instruction, index) => (
                                        <div
                                            className={css.instruction}
                                            key={`${tutorial.name}-${index}`}
                                        >
                                            <div
                                                className={css.instructionIndex}
                                            >
                                                {index + 1}
                                            </div>
                                            <div>{instruction.message}</div>
                                        </div>
                                    )
                                )}
                            </ul>
                            <a
                                href={tutorial.helpDocsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={css.helpDocLink}
                            >
                                <i className="material-icons">menu_book</i>
                                <span>{tutorial.name} Help Docs</span>
                            </a>
                        </AccordionBody>
                    </AccordionItem>
                ))}
                {footer}
            </Accordion>
        </div>
    )
}
