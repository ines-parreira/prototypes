import React, {useState} from 'react'
import {useSearchParam} from 'hooks/useSearchParam'
import SuccessModal from 'pages/common/components/SuccessModal'
import {SuccessModalIcon} from 'pages/common/components/SuccessModal/SuccessModal'
import HeroImageCarousel, {
    CarouselData,
} from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import {assetsUrl} from 'utils'
import {
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../constants'
import css from './PostCompletionWizardModal.less'

type ModalParams = {
    title?: string
    subtitle?: string
    icon?: SuccessModalIcon
    gif?: string
    buttonLabel?: string
    description?: string
    size?: 'small' | 'medium' | 'large' | 'huge'
    slidesData?: CarouselData[]
}

const getModalParams = (
    state?: WIZARD_POST_COMPLETION_STATE
): ModalParams | null => {
    switch (state) {
        case WIZARD_POST_COMPLETION_STATE.configuration:
            return {
                title: 'Great work!',
                icon: SuccessModalIcon.PinchingHand,
                buttonLabel: 'Explore AI Agent',
                description:
                    'We’ll let you know when your knowledge finishes syncing.',
                size: 'small',
            }
        case WIZARD_POST_COMPLETION_STATE.test:
            return {
                title: 'Great work!',
                subtitle:
                    'Put AI Agent’s knowledge to the test in the playground before setting it live',
                gif: '/img/ai-agent/ai_agent_testmode.gif',
                buttonLabel: 'Try Test mode',
                size: 'medium',
            }
        case WIZARD_POST_COMPLETION_STATE.guidance:
            return {
                slidesData: [
                    {
                        header: 'Great work! Before setting it live, you can power AI Agent with more knowledge using Guidance',
                        imageUrl: assetsUrl(
                            '/img/ai-agent/ai_agent_guidance.png'
                        ),
                        description:
                            'Write text-based instructions that explains your policies and processes so it can perform like a real agent.',
                        footerButton: 'Next',
                    },
                    {
                        header: 'Connect 3rd party apps to automate requests with Actions',
                        imageUrl: assetsUrl(
                            '/img/ai-agent/ai_agent_actions.png'
                        ),
                        description:
                            'Use your ecommerce tools to resolve common and repetitive asks from your customers, like changing their shipping address.',
                        footerButton: 'Next',
                    },
                    {
                        header: 'Assess AI Agent’s knowledge in the test area, then set it live!',
                        imageUrl: assetsUrl('/img/ai-agent/ai_agent_test.png'),
                        description:
                            'Simulate real interactions in test mode to build confidence in AI Agent’s performance. Once you feel good about it’s responses, set it live!',
                        footerButton: 'Done',
                    },
                ],
            }
        default:
            return null
    }
}

const isWizardPostCompletionState = (
    value: any
): value is WIZARD_POST_COMPLETION_STATE => {
    return Object.values(WIZARD_POST_COMPLETION_STATE).includes(value)
}

const PostCompletionWizardModal = () => {
    const [value, setSearchParam] = useSearchParam(
        WIZARD_POST_COMPLETION_QUERY_KEY
    )

    const modalState = isWizardPostCompletionState(value) ? value : undefined
    const [isOpen, setIsOpen] = useState(modalState !== undefined)

    const [modalParams] = useState(getModalParams(modalState))
    const onClose = () => {
        setIsOpen(false)
        setSearchParam(null)

        if (modalState === WIZARD_POST_COMPLETION_STATE.configuration) {
            setSearchParam(WIZARD_POST_COMPLETION_STATE.knowledge)
        }
        if (modalState === WIZARD_POST_COMPLETION_STATE.test) {
            setSearchParam(WIZARD_POST_COMPLETION_STATE.test_subject)
        }
    }

    if (!modalParams) {
        return null
    }

    return (
        <>
            {modalParams.slidesData ? (
                <Modal
                    classNameDialog={css.modalDialog}
                    isOpen={isOpen}
                    onClose={onClose}
                >
                    <ModalHeader title="" className={css.header} />
                    <ModalBody className={css.content}>
                        <HeroImageCarousel
                            slides={modalParams.slidesData}
                            width={638}
                            classNameHeader={css.carouselHeader}
                            classNameImage={css.carouselImage}
                            classNameDescription={css.carouselDescription}
                            classNameSlideAction={css.carouselSlideAction}
                            classNameActionIcon={css.carouselActionIcon}
                            onClose={onClose}
                        />
                    </ModalBody>
                </Modal>
            ) : (
                <SuccessModal
                    isOpen={isOpen}
                    onClose={onClose}
                    buttonLabel={modalParams.buttonLabel ?? ''}
                    icon={modalParams.icon}
                    gif={modalParams.gif}
                    size={modalParams.size}
                >
                    <div>
                        <div className={css.titleWrapper}>
                            <div>{modalParams.title}</div>
                            {modalParams.subtitle && (
                                <div>{modalParams.subtitle}</div>
                            )}
                        </div>
                        <span className={css.description}>
                            {modalParams.description}
                        </span>
                    </div>
                </SuccessModal>
            )}
        </>
    )
}

export default PostCompletionWizardModal
