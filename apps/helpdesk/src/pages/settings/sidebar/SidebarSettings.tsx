import React, { useMemo, useState } from 'react'

import classNames from 'classnames'
import { produce } from 'immer'
import _isEqual from 'lodash/isEqual'

import { LegacyButton as Button } from '@gorgias/axiom'

import navbarPreview from 'assets/img/presentationals/navbar_settings.png'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import settingsCss from 'pages/settings/settings.less'
import { submitSetting } from 'state/currentAccount/actions'
import { getViewsVisibilitySettings } from 'state/currentAccount/selectors'
import {
    AccountSettingType,
    AccountSettingViewsVisibility,
} from 'state/currentAccount/types'
import {
    getBottomSystemTicketNavbarWithHiddenElements,
    getTopSystemTicketNavbarWithHiddenElements,
} from 'state/views/selectors'

import css from './SidebarSettings.less'

type SystemView = {
    id: number
    enabled: boolean
    name: string
}

const SidebarSettings = () => {
    const dispatch = useAppDispatch()
    const systemTopViews = useAppSelector(
        getTopSystemTicketNavbarWithHiddenElements,
    )
    const systemBottomViews = useAppSelector(
        getBottomSystemTicketNavbarWithHiddenElements,
    )
    const viewVisibilitySetting = useAppSelector(getViewsVisibilitySettings)

    const settingsSystemViews: SystemView[] = useMemo(() => {
        const hiddenViews = viewVisibilitySetting?.data?.hidden_views || []
        return [
            ...systemTopViews.map((view) => ({
                id: view.data.id,
                enabled: !hiddenViews.includes(view.data.id),
                name: view.data.name,
            })),
            ...systemBottomViews.map((view) => ({
                id: view.data.id,
                enabled: !hiddenViews.includes(view.data.id),
                name: view.data.name,
            })),
        ]
    }, [systemTopViews, systemBottomViews, viewVisibilitySetting])

    const [selectedViews, setSelectedViews] =
        useState<SystemView[]>(settingsSystemViews)
    const [isSaving, setSaving] = useState<boolean>(false)

    const isSaveEnabled = useMemo(() => {
        return !_isEqual(selectedViews, settingsSystemViews)
    }, [selectedViews, settingsSystemViews])

    const handleViewChecked = (index: number) => {
        const newViews = produce(selectedViews, (draft) => {
            draft[index].enabled = !draft[index].enabled
        })
        setSelectedViews([...newViews])
    }

    const handleSave = async () => {
        const hiddenViews = selectedViews
            .filter((view) => !view.enabled)
            .map((view) => view.id)

        const enabledViews = selectedViews
            .filter((view) => view.enabled)
            .map((view) => view.name)

        logEvent(SegmentEvent.SidebarViewsChanged, {
            enabled_views: enabledViews,
        })

        const settings: Partial<AccountSettingViewsVisibility> =
            viewVisibilitySetting || {
                type: AccountSettingType.ViewsVisibility,
            }

        setSaving(true)
        await dispatch(
            submitSetting({
                ...settings,
                data: { hidden_views: hiddenViews },
            } as AccountSettingViewsVisibility),
        )
        setSaving(false)
    }

    return (
        <div className="full-width flex flex-column">
            <PageHeader title="Default views" />

            <div className={classNames('flex', 'full-height', css.container)}>
                <div
                    className={classNames(
                        settingsCss.contentWrapper,
                        settingsCss.pageContainer,
                        css.contentWrapper,
                    )}
                >
                    <div className={css.infoContent}>
                        <div
                            className={classNames(
                                settingsCss.mb24,
                                css.infoText,
                            )}
                        >
                            Choose which Views you want visible in the Ticket
                            Navigation panel.
                            <br />
                            This impacts all users in your account. Note that
                            your shared and private views will not be impacted.
                        </div>
                    </div>
                    <div className={settingsCss.mb32}>
                        {selectedViews.map((view, index) => (
                            <CheckBox
                                key={view.id}
                                name={view.name}
                                isChecked={view.enabled}
                                onChange={() => handleViewChecked(index)}
                                className={settingsCss.mb16}
                            >
                                {view.name}
                            </CheckBox>
                        ))}
                    </div>
                    <Button
                        isDisabled={!isSaveEnabled}
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        Save Changes
                    </Button>
                </div>
                <div className={css.preview}>
                    <img src={navbarPreview} alt="Navbar preview" />
                </div>
            </div>
        </div>
    )
}

export default SidebarSettings
