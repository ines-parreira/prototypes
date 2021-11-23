import React, {useMemo} from 'react'
import classNames from 'classnames'
import {Map} from 'immutable'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'
import {FormText, Label} from 'reactstrap'

import {IntegrationType} from '../../../../../../../models/integration/types'
import {getIntegrationsByTypes} from '../../../../../../../state/integrations/selectors'
import SelectField from '../../../../../../common/forms/SelectField/SelectField'
import ToggleField from '../../../../../../common/forms/ToggleField'
import {useHelpCenterTranslation} from '../../../../providers/HelpCenterTranslation'

import css from './ChatApplication.less'

const ChatApplication: React.FC = () => {
    const {
        translation: {chatApplicationId},
        updateTranslation,
    } = useHelpCenterTranslation()

    const chatIntegrations = useSelector(
        getIntegrationsByTypes(IntegrationType.GorgiasChat)
    )
    const chatOptions = useMemo(
        () =>
            chatIntegrations
                .toArray()
                .filter((chat: Map<any, any>) => {
                    const deactivatedDatetime = chat.get('deactivated_datetime')

                    return !deactivatedDatetime
                })
                .map((chat: Map<any, any>) => ({
                    label: chat.get('name') as string,
                    value: parseInt(
                        chat.getIn(['meta', 'app_id']) as string,
                        10
                    ),
                })),
        [chatIntegrations]
    )

    const handleChange = (chatApplicationId: number | null) => {
        updateTranslation({chatApplicationId})
    }

    const toggleChatEnabled = () => {
        handleChange(
            chatApplicationId == null && chatOptions.length > 0
                ? chatOptions[0].value
                : null
        )
    }

    return (
        <>
            <ToggleField
                label="Enable chat widget"
                value={!!chatApplicationId}
                onChange={toggleChatEnabled}
                disabled={chatOptions.length === 0}
                className={css.toggle}
            />
            <p>This makes a chat widget visible for all help center pages.</p>

            {chatOptions.length === 0 && (
                <div className={css['warning-no-chat']}>
                    <span className="float-right">
                        <Link to="/app/settings/integrations/gorgias_chat">
                            Create Chat
                        </Link>
                    </span>
                    <span className={classNames(css['warning-icon'], 'mr-2')}>
                        <i className="material-icons">report_problem</i>
                    </span>
                    You don't have any existing chat integration. Please create
                    one to enable.
                </div>
            )}

            {chatApplicationId != null && chatOptions.length > 0 && (
                <>
                    <Label className="control-label">Chat selection</Label>
                    <SelectField
                        value={chatApplicationId}
                        options={chatOptions}
                        onChange={(value) => handleChange(value as number)}
                        placeholder="Select a chat"
                        fullWidth
                    />

                    <FormText color="muted">
                        Chat that's going to be triggered when clicking here
                    </FormText>
                </>
            )}
        </>
    )
}

export default ChatApplication
