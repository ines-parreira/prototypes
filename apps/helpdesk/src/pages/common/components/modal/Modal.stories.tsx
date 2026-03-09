import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from './Modal'
import ModalActionsFooter from './ModalActionsFooter'
import ModalBody from './ModalBody'
import ModalFooter from './ModalFooter'
import ModalHeader from './ModalHeader'

import css from './Modal.stories.less'

const storyConfig: Meta = {
    title: 'General/Modal',
    component: Modal,
    argTypes: {
        subtitle: {
            control: {
                type: 'text',
            },
        },
    },
}

const Template: StoryObj<
    Partial<ComponentProps<typeof Modal> & ComponentProps<typeof ModalHeader>>
> = {
    render: function Template({ children, subtitle, title, ...props }) {
        const [isOpen, setIsOpen] = useState(false)

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Open me</Button>
                <Modal
                    {...props}
                    onClose={() => setIsOpen(false)}
                    isOpen={isOpen}
                    container={document.getElementById('root') as Element}
                >
                    <ModalHeader subtitle={subtitle} title={title} />
                    <ModalBody>{children}</ModalBody>
                    <ModalActionsFooter>
                        <Button
                            intent="secondary"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </Button>
                        <Button onClick={() => setIsOpen(false)}>Cool</Button>
                    </ModalActionsFooter>
                </Modal>
            </>
        )
    },
}

const defaultProps: Partial<
    ComponentProps<typeof Modal> & ComponentProps<typeof ModalHeader>
> = {
    children: `Ares is the Greek god of courage and war. He is one of the Twelve Olympians, and the son of Zeus and Hera. The Greeks were ambivalent toward him. He embodies the physical valor necessary for success in war but can also personify sheer brutality and bloodlust, in contrast to his sister, the armored Athena, whose martial functions include military strategy and generalship. An association with Ares endows places, objects, and other deities with a savage, dangerous, or militarized quality.
    Although Ares\' name shows his origins as Mycenaean, his reputation for savagery was thought by some to reflect his likely origins as a Thracian deity. Some cities in Greece and several in Asia Minor held annual festivals to bind and detain him as their protector. In parts of Asia Minor, he was an oracular deity. Still further away from Greece, the Scythians were said to ritually kill one in a hundred prisoners of war as an offering to their equivalent of Ares. The later belief that ancient Spartans had offered human sacrifice to Ares may owe more to mythical prehistory, misunderstandings, and reputation than to reality.
    Though there are many literary allusions to Ares' love affairs and children, he has a limited role in Greek mythology. When he does appear, he is often humiliated. In the Trojan War, Aphrodite, protector of Troy, persuades Ares to take the Trojan's side. The Trojans lose, while Ares' sister Athena helps the Greeks to victory. Most famously, when the craftsman-god Hephaestus discovers his wife Aphrodite is having an affair with Ares, he traps the lovers in a net and exposes them to the ridicule of the other gods.
    Ares' nearest counterpart in Roman religion is Mars, who was given a more important and dignified place in ancient Roman religion as ancestral protector of the Roman people and state. During the Hellenization of Latin literature, the myths of Ares were reinterpreted by Roman writers under the name of Mars, and in later Western art and literature, the mythology of the two figures became virtually indistinguishable.`,
    title: 'Did you know?',
    isOpen: false,
}

export const Default = {
    ...Template,
    args: defaultProps,
}

const TemplateWithExtraFooterInfo: StoryObj<
    Partial<ComponentProps<typeof Modal> & ComponentProps<typeof ModalHeader>>
> = {
    render: function TemplateWithExtraFooterInfo({
        children,
        subtitle,
        title,
        ...props
    }) {
        const [isOpen, setIsOpen] = useState(false)

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Open me</Button>
                <Modal
                    {...props}
                    onClose={() => setIsOpen(false)}
                    isOpen={isOpen}
                    container={document.getElementById('root') as Element}
                >
                    <ModalHeader subtitle={subtitle} title={title} />
                    <ModalBody>{children}</ModalBody>
                    <ModalActionsFooter extra="Mythology is cool">
                        <Button
                            intent="secondary"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </Button>
                        <Button onClick={() => setIsOpen(false)}>Cool</Button>
                    </ModalActionsFooter>
                </Modal>
            </>
        )
    },
}

export const WithExtraFooterInfo = {
    ...TemplateWithExtraFooterInfo,
    args: defaultProps,
}

const WithCustomFooterTemplate: StoryObj<
    Partial<ComponentProps<typeof Modal> & ComponentProps<typeof ModalHeader>>
> = {
    render: function WithCustomFooterTemplate({
        children,
        subtitle,
        title,
        ...props
    }) {
        const [isOpen, setIsOpen] = useState(false)

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Open me</Button>
                <Modal
                    {...props}
                    onClose={() => setIsOpen(false)}
                    isOpen={isOpen}
                    container={document.getElementById('root') as Element}
                >
                    <ModalHeader subtitle={subtitle} title={title} />
                    <ModalBody>{children}</ModalBody>
                    <ModalFooter className={css.footer}>
                        <span>Zeus and Hera are his parents</span>
                        <span>Amazons are his children</span>
                    </ModalFooter>
                </Modal>
            </>
        )
    },
}

export const WithCustomFooter = {
    ...WithCustomFooterTemplate,
    args: defaultProps,
}

export default storyConfig
