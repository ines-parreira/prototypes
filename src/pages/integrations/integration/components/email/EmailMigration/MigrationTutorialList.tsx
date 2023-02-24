import React from 'react'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import {providerTutorials} from './constants'

import css from './MigrationTutorialList.less'

export default function MigrationTutorialList() {
    return (
        <div className={css.container}>
            <p>
                Follow a step-by-step tutorial to set up forwarding. Make sure
                you’re logged in to the correct email before starting.
            </p>
            <Accordion>
                {providerTutorials.map((provider) => (
                    <AccordionItem key={provider.name}>
                        <AccordionHeader>
                            <img
                                src={provider.icon}
                                alt={provider.name}
                                className={css.providerIcon}
                            />
                            {provider.name}
                        </AccordionHeader>
                        <AccordionBody>
                            <ul>
                                {provider.instructions.map(
                                    (instruction, index) => (
                                        <div
                                            className={css.instruction}
                                            key={`${provider.name}-${index}`}
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
                                href={provider.helpDocsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={css.helpDocLink}
                            >
                                <i className="material-icons">menu_book</i>
                                <span>{provider.name} Help Docs</span>
                            </a>
                        </AccordionBody>
                    </AccordionItem>
                ))}
            </Accordion>
            <a
                href="https://docs.gorgias.com/en-US/other-provider-81758"
                target="_blank"
                rel="noopener noreferrer"
                className={css.helpDocLink}
            >
                Other Providers
            </a>
        </div>
    )
}
