import React from 'react'

import { List } from 'immutable'

import { Button } from '@gorgias/axiom'

import {
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
} from 'pages/aiAgent/constants'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ListField from 'pages/common/forms/ListField'

import { useHandoverTopics } from '../../hooks/useHandoverTopics'

import css from './HandoverTopicsModel.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    accountDomain: string
    shopName: string
}

export const HandoverTopicsModal = ({
    isOpen,
    onClose,
    accountDomain,
    shopName,
}: Props) => {
    const {
        isLoading,
        handleSave,
        handleCancel,
        excludedTopics,
        setExcludedTopics,
    } = useHandoverTopics({
        accountDomain,
        shopName,
        onClose,
    })

    return (
        <Modal isOpen={isOpen} size="medium" onClose={handleCancel}>
            <ModalHeader title="Handover Topics" />
            <ModalBody>
                <div>
                    Define topics for AI Agent to always hand over to agents. We
                    recommend limiting it to 5 or less.{' '}
                    <a
                        href="https://docs.gorgias.com/en-US/customize-how-ai-agent-behaves-567324"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more about handovers.
                    </a>
                    <ListField
                        className={css.container}
                        items={List(excludedTopics)}
                        onChange={(excludedTopics: List<string>) => {
                            setExcludedTopics(excludedTopics.toJS())
                        }}
                        placeholder="e.g. Invoice and billing, Data privacy, or Complaints"
                        maxLength={EXCLUDED_TOPIC_MAX_LENGTH}
                        maxItems={MAX_EXCLUDED_TOPICS}
                        addLabel="Add Topic"
                        dataCanduId="ai-agent-configuration-handover-topics"
                    />
                </div>
            </ModalBody>
            <ModalFooter className={css.modalFooterWrapper}>
                <Button
                    intent="secondary"
                    onClick={handleCancel}
                    isDisabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        handleSave()
                    }}
                    isLoading={isLoading}
                >
                    Confirm Topics
                </Button>
            </ModalFooter>
        </Modal>
    )
}
