import type { ComponentProps } from 'react'
import { useState } from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import gorgiasChatSSPaywall from 'assets/img/paywalls/screens/gorgias_chat_ssp_automate.png'
import overviewStatsPaywall from 'assets/img/paywalls/screens/live-overview-statistic.png'
import { testimonial as testimonialFixture } from 'fixtures/paywall'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import Paywall from './Paywall'

const storyConfig: Meta = {
    title: 'Layout/Paywall',
    component: Paywall,
    parameters: {
        docs: {
            description: {
                component: 'Presentational component for displaying paywalls.',
            },
        },
    },
    argTypes: {
        paywallTheme: {
            control: {
                type: 'select',
            },
        },
        previewImage: {
            description: 'Custom JSX you want to use as actions.',
        },
        pageHeader: {
            description: 'Custom JSX you want to use as header.',
        },
        renderFilterShadow: {
            description: 'Use CSS filter shadow instead od box-shadow.',
            control: {
                type: 'boolean',
            },
        },
        updateType: {
            control: {
                type: 'select',
            },
        },
        testimonial: {
            description: 'Customer testimonial object.',
            control: {
                type: 'object',
            },
        },
        customCta: {
            description: 'Custom JSX you want to use as the upgrade CTA.',
            options: ['null', 'button'],
            mapping: {
                null: null,
                button: <Button>Upgrade me !</Button>,
            },
        },
        modal: {
            description:
                'Custom JSX you want to use for a modal (linked manually to customCta).',
            control: {
                type: 'object',
            },
        },
        shouldKeepPrice: {
            description: 'Display the legacy badge.',
        },
    },
    decorators: [
        (storyFn, context) => {
            return (
                <MemoryRouter>
                    <div
                        style={{
                            zIndex: 0,
                            position: 'relative',
                            overflow: 'hidden',
                            height:
                                context.viewMode === 'story' ? '100vh' : '70vh',
                        }}
                    >
                        {storyFn()}
                    </div>
                </MemoryRouter>
            )
        },
    ],
}

const Template: StoryObj<typeof Paywall> = {
    render: (props) => <Paywall {...props} />,
}

const WithModalTemplate: StoryObj<typeof Paywall> = {
    render: function Template(props) {
        const [isModalOpened, setModalOpened] = useState(false)

        const toggle = () => setModalOpened(!isModalOpened)
        return (
            <Paywall
                {...props}
                customCta={<Button onClick={toggle}>Upgrade me !</Button>}
                modal={
                    <Modal
                        isOpen={isModalOpened}
                        onClose={() => setModalOpened(false)}
                    >
                        <ModalBody>Hi there !</ModalBody>
                    </Modal>
                }
            />
        )
    },
}

const defaultProps: ComponentProps<typeof Paywall> = {
    requiredUpgrade: 'Foo',
    header: 'Feature',
    description: 'This is a very cool feature.',
    previewImage: overviewStatsPaywall,
}
export const Default = {
    ...Template,
    args: defaultProps,
}

export const WithPageHeader = {
    ...Template,
    args: { ...defaultProps, pageHeader: 'Page Header' },
}

export const WithFilterShadow = {
    ...Template,
    args: {
        ...defaultProps,
        renderFilterShadow: true,
        previewImage: gorgiasChatSSPaywall,
    },
}

export const WithTestimonial = {
    ...Template,
    args: { ...defaultProps, testimonial: testimonialFixture },
}

export const WithModal = {
    ...WithModalTemplate,
    args: defaultProps,
}

export default storyConfig
