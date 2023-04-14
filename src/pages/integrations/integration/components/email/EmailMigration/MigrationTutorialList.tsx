import React, {ReactNode} from 'react'
import classNames from 'classnames'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import NumberedList from './NumberedList'

import css from './MigrationTutorialList.less'

type Instruction = {
    message: ReactNode
}

type Tutorial = {
    name: string
    icon?: string
    iconIdType?: 'name' | 'src'
    helpDocsUrl?: string
    instructions: Instruction[]
    description?: string
}

type Props = {
    description?: ReactNode
    footer?: ReactNode
    tutorials: Tutorial[]
    isDefaultOpen?: boolean
}

export default function MigrationTutorialList({
    description,
    footer,
    tutorials,
    isDefaultOpen,
}: Props) {
    return (
        <div className={css.container}>
            {description}
            <Accordion
                defaultExpandedItem={isDefaultOpen ? tutorials[0].name : null}
            >
                {tutorials.map((tutorial) => (
                    <AccordionItem id={tutorial.name} key={tutorial.name}>
                        <AccordionHeader>
                            {tutorial.icon &&
                                (tutorial.iconIdType === 'name' ? (
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.tutorialIcon
                                        )}
                                    >
                                        {tutorial.icon}
                                    </i>
                                ) : (
                                    <img
                                        src={tutorial.icon}
                                        alt={tutorial.name}
                                        className={css.tutorialIcon}
                                    />
                                ))}
                            {tutorial.name}
                        </AccordionHeader>
                        <AccordionBody>
                            {tutorial.description && (
                                <div className={css.tutorialDescription}>
                                    {tutorial.description}
                                </div>
                            )}
                            <NumberedList
                                items={tutorial.instructions.map(
                                    ({message}) => message
                                )}
                            />
                            {tutorial.helpDocsUrl && (
                                <a
                                    href={tutorial.helpDocsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={css.helpDocLink}
                                >
                                    <i className="material-icons">menu_book</i>
                                    <span>{tutorial.name} Help Docs</span>
                                </a>
                            )}
                        </AccordionBody>
                    </AccordionItem>
                ))}
                {footer}
            </Accordion>
        </div>
    )
}
