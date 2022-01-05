import React, {ReactNode, useState} from 'react'
import _noop from 'lodash/noop'
import {
    Button,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'

import {RuleRecipe} from 'models/ruleRecipe/types'

import RuleEditor from '../../components/RuleEditor'
import {RuleItemActions} from '../../types'

import css from './RuleRecipeModal.less'

type Props = {
    recipe: RuleRecipe
    handleInstall: (shouldCreateViews: boolean) => void
    renderTags: () => ReactNode
    handleRule: RuleItemActions
    isOpen: boolean
    onToggle: () => void
    shouldInstall: boolean
}

export const RuleRecipeModal = ({
    recipe,
    handleInstall,
    renderTags,
    handleRule,
    isOpen,
    onToggle,
    shouldInstall,
}: Props) => {
    const {rule, triggered_count} = recipe
    const [shouldCreateviews, setShouldCreateViews] = useState(true)

    return (
        <Modal
            isOpen={isOpen}
            toggle={onToggle}
            fade={false}
            size="lg"
            className={css.modalContainer}
        >
            <ModalHeader toggle={onToggle}>
                <span>{rule.name}</span>
                <span className={css.tags}>{renderTags()}</span>
            </ModalHeader>
            <ModalBody>
                <div className={css.modalBody}>
                    <div className={css.modalDescription}>
                        This is a template rule. You can see below the detail of
                        the rule that will be installed on your account. You can
                        always modify this rule like any other rule once
                        installed to better suit your needs!
                    </div>
                    <div>
                        <div className={css.targetTitle}>target up to</div>
                        <div className={css.targetValue}>
                            <span className={css.bold}>{triggered_count}</span>{' '}
                            tickets/month
                        </div>
                    </div>
                </div>
                <div className={css.ruleEditorContainer}>
                    <RuleEditor
                        ruleDraft={rule}
                        actions={handleRule}
                        handleEventChanges={_noop}
                        className={css.ruleEditor}
                    />
                </div>
                <FormGroup check className="mb-1 mt-3">
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={shouldCreateviews}
                            onChange={(e) =>
                                setShouldCreateViews(e.target.checked)
                            }
                        />
                        <span className="ml-1">
                            <strong>
                                Create the views related to this rule.
                            </strong>
                        </span>
                    </Label>
                </FormGroup>
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <Button onClick={onToggle}>Cancel</Button>
                <Button
                    color="primary"
                    onClick={() => {
                        void handleInstall(shouldCreateviews)
                        onToggle()
                    }}
                    disabled={!shouldInstall}
                >
                    Add rule
                </Button>
            </ModalFooter>
        </Modal>
    )
}
