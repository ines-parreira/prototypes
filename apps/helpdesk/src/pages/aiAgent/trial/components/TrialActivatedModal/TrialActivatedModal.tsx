import type { FC } from 'react'

import classNames from 'classnames'

import {
    LegacyBadge as Badge,
    Box,
    LegacyButton as Button,
    Separator,
} from '@gorgias/axiom'

import {
    ModalBodyWrapper,
    ModalFooterWrapper,
    ModalHeaderWrapper,
    ModalWrapper,
} from '../ModalWrapper'

import css from './TrialActivatedModal.less'

export type TrialActivatedModalProps = {
    title: string
    onConfirm: () => void
}
export const TrialActivatedModal: FC<TrialActivatedModalProps> = ({
    title,
    onConfirm,
}) => {
    return (
        <ModalWrapper isOpen size="lg" fade centered>
            <ModalHeaderWrapper>{title}</ModalHeaderWrapper>
            <ModalBodyWrapper>
                <div className={css.descriptionWrapper}>
                    <div className={css.descriptionContainer}>
                        <div className={css.descriptionTitle}>
                            Your Shopping Assistant is live!
                        </div>
                        <div className={css.descriptionText}>
                            You&apos;re all set to start turning website
                            visitors into buyers. Take a few quick steps to
                            unlock its full potential.
                        </div>
                    </div>
                </div>
                <div className={css.rightSide}>
                    <div className={css.detailsWrapper}>
                        <div className={css.detailsContainer}>
                            <div className={css.condition}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.successCheck,
                                    )}
                                >
                                    check_circle
                                </i>
                                <div className={css.conditionText}>
                                    <div className={css.conditionTextTitle}>
                                        Shopping Assistant activated
                                    </div>
                                    <div className={css.conditionTextSubtitle}>
                                        14 day trial
                                    </div>
                                </div>
                            </div>
                            <Box h="44px" ml="16px">
                                <Separator direction="vertical" />
                            </Box>
                            <div className={css.condition}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.successCheckOutline,
                                    )}
                                >
                                    check_circle_outline
                                </i>
                                <div className={css.conditionText}>
                                    <div className={css.conditionTextTitle}>
                                        Proactively engage customers
                                    </div>
                                    <div className={css.conditionTextSubtitle}>
                                        Turn on customer engagement features
                                    </div>
                                    <div className={css.discountBadgeWrapper}>
                                        <Badge
                                            corner="square"
                                            type="magenta"
                                            className={css.discountBadge}
                                        >
                                            <i
                                                className={classNames(
                                                    'material-icons',
                                                    css.discountBadgeIcon,
                                                )}
                                            >
                                                bolt
                                            </i>
                                            <span
                                                className={
                                                    css.discountBadgeText
                                                }
                                            >
                                                Boost conversion by 15%
                                            </span>
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Box h="44px" ml="16px">
                                <Separator direction="vertical" />
                            </Box>
                            <div className={css.condition}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.successCheckOutline,
                                    )}
                                >
                                    check_circle_outline
                                </i>
                                <div className={css.conditionText}>
                                    <div className={css.conditionTextTitle}>
                                        Offer smart discounts
                                    </div>
                                    <div className={css.conditionTextSubtitle}>
                                        Set up your discount strategy
                                    </div>
                                    <div className={css.discountBadgeWrapper}>
                                        <Badge
                                            corner="square"
                                            type="magenta"
                                            className={css.discountBadge}
                                        >
                                            <i
                                                className={classNames(
                                                    'material-icons',
                                                    css.discountBadgeIcon,
                                                )}
                                            >
                                                bolt
                                            </i>
                                            <span
                                                className={
                                                    css.discountBadgeText
                                                }
                                            >
                                                Increase conversions by up to
                                                +50%
                                            </span>
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBodyWrapper>
            <ModalFooterWrapper>
                <Button
                    className={css.completeSetUpButton}
                    intent="primary"
                    onClick={onConfirm}
                >
                    Complete Set Up
                </Button>
            </ModalFooterWrapper>
        </ModalWrapper>
    )
}
