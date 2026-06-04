import { useState } from 'react'

import {
    Box,
    Button,
    Icon,
    MultiButton,
    Popover,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import css from './WizardFooter.less'

type Props = {
    currentStep: 1 | 2
    onCancel: () => void
    onBack: () => void
    onContinue: () => void
    isContinueDisabled: boolean
    onSaveAndEnable: () => void
    onSaveAndTest: () => void
    isSaving: boolean
    isSaveDisabled: boolean
    isTestDisabled: boolean
}

export const WizardFooter = ({
    currentStep,
    onCancel,
    onBack,
    onContinue,
    isContinueDisabled,
    onSaveAndEnable,
    onSaveAndTest,
    isSaving,
    isSaveDisabled,
    isTestDisabled,
}: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleSelectAction = (action: 'enable' | 'test') => {
        setIsMenuOpen(false)

        if (action === 'test') {
            onSaveAndTest()
        } else {
            onSaveAndEnable()
        }
    }

    if (currentStep === 1) {
        return (
            <div className={css.footer}>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={onContinue}
                    aria-disabled={isContinueDisabled || undefined}
                    aria-describedby={
                        isContinueDisabled
                            ? 'wizard-continue-disabled-hint'
                            : undefined
                    }
                    isDisabled={isContinueDisabled}
                >
                    Continue
                </Button>
                {isContinueDisabled && (
                    <span
                        id="wizard-continue-disabled-hint"
                        className={css.srOnly}
                    >
                        Fill in action name and description to continue.
                    </span>
                )}
            </div>
        )
    }

    return (
        <div
            className={css.footer}
            aria-live="polite"
            aria-busy={isSaving || undefined}
        >
            <Button variant="secondary" onClick={onBack}>
                Back
            </Button>
            <MultiButton variant="primary" width="auto">
                <Button
                    onClick={onSaveAndEnable}
                    isLoading={isSaving}
                    isDisabled={isSaveDisabled}
                >
                    Save and enable
                </Button>
                <Popover
                    isOpen={isMenuOpen}
                    onOpenChange={setIsMenuOpen}
                    placement="top right"
                    padding={0}
                    trigger={
                        <Button
                            aria-label="Show save options"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                            isDisabled={isSaveDisabled || isSaving}
                            icon={
                                <Icon
                                    name={
                                        isMenuOpen
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                />
                            }
                        />
                    }
                >
                    <Box flexDirection="column" minWidth={180}>
                        <div className={css.menu} role="menu">
                            <button
                                type="button"
                                className={css.menuItem}
                                role="menuitem"
                                disabled={isSaveDisabled || isSaving}
                                onClick={() => handleSelectAction('enable')}
                            >
                                <Text size="sm">Save and enable</Text>
                            </button>
                            {isTestDisabled ? (
                                <Tooltip
                                    trigger={
                                        <button
                                            type="button"
                                            className={css.menuItem}
                                            role="menuitem"
                                            disabled
                                        >
                                            <Text size="sm">Save and test</Text>
                                        </button>
                                    }
                                >
                                    <TooltipContent title="Action must be enabled to test." />
                                </Tooltip>
                            ) : (
                                <button
                                    type="button"
                                    className={css.menuItem}
                                    role="menuitem"
                                    disabled={isSaveDisabled || isSaving}
                                    onClick={() => handleSelectAction('test')}
                                >
                                    <Text size="sm">Save and test</Text>
                                </button>
                            )}
                        </div>
                    </Box>
                </Popover>
            </MultiButton>
        </div>
    )
}
