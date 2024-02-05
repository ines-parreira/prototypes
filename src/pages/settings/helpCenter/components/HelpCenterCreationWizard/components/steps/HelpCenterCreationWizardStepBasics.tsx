import React, {useEffect, useMemo, useState} from 'react'

import {
    HelpCenter,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {
    HELP_CENTER_DOMAIN,
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
    NEXT_ACTION,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import InputField from 'pages/common/forms/input/InputField'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import Label from 'pages/common/forms/Label/Label'

import {
    Language,
    LanguagePicker,
} from 'pages/common/components/LanguagePicker/LanguagePicker'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import {slugify} from 'utils'
import {
    getSubdomainValidationError,
    isValidSubdomain,
} from 'pages/settings/helpCenter/utils/validations'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import history from 'pages/history'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {useCheckHelpCenterWithSubdomainExists} from 'models/helpCenter/queries'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {useStoreOptions} from 'pages/settings/helpCenter/hooks/useStoreOptions'
import store from 'assets/img/icons/store.svg'
import useDebounce from 'hooks/useDebounce'
import DiscardNewHelpCenterPrompt from '../DiscardNewHelpCenterPrompt'
import {useHelpCenterCreationWizard} from '../../hooks/useHelpCenterCreationWizard'
import {
    mapHelpCenterLanguagesToLanguagePicker,
    mapHelpCenterLocalesToLanguagePicker,
    mapLanguagePickerToHelpCenterLanguages,
} from '../../HelpCenterCreationWizardUtils'
import css from './HelpCenterCreationWizardStepBasics.less'

type Props = {
    helpCenter?: HelpCenter
    isUpdate: boolean
    automateType: HelpCenterAutomateType
}

const HelpCenterCreationWizardStepBasics: React.FC<Props> = ({
    helpCenter,
    isUpdate,
    automateType,
}) => {
    const {
        helpCenter: newHelpCenter,
        allStoreIntegrations,
        updateData: updateBasicsData,
        onSave,
        isLoading: isLoading,
    } = useHelpCenterCreationWizard(
        helpCenter,
        HelpCenterCreationWizardStep.Basics
    )
    const helpCenterLocales = useSupportedLocales()
    const integrationOptions = useStoreOptions({
        option: css['storeOption'],
        icon: css['storeIcon'],
    })

    const uiLanguageOptions = useMemo(() => {
        return mapHelpCenterLocalesToLanguagePicker(helpCenterLocales)
    }, [helpCenterLocales])
    const languagePickerLanguages = useMemo(
        () =>
            mapHelpCenterLanguagesToLanguagePicker(
                helpCenter,
                uiLanguageOptions
            ),
        [helpCenter, uiLanguageOptions]
    )

    const [isPristine, setIsPristine] = useState(true)
    const [isPristineSubdomain, setPristineSubdomain] = useState(true)
    const [isStoreRequired, setIsStoreRequired] = useState(false)
    const [shouldDisplayFormErrors, setShouldDisplayFormErrors] =
        useState(false)

    const {
        mutateAsync: checkHepCenterMutateAsync,
        isError: isSubdomainAvailable,
    } = useCheckHelpCenterWithSubdomainExists()

    const isAutomate = automateType === HelpCenterAutomateType.AUTOMATE

    useEffect(() => {
        const isStoreRequired =
            isAutomate || newHelpCenter.platformType === PlatformType.ECOMMERCE
        setIsStoreRequired(isStoreRequired)
    }, [isAutomate, newHelpCenter.platformType])

    useDebounce(
        () => {
            if (
                !newHelpCenter.subdomain ||
                !isValidSubdomain(newHelpCenter.subdomain)
            ) {
                return
            }

            void checkHepCenterMutateAsync([
                undefined,
                {subdomain: newHelpCenter.subdomain},
            ])
        },
        500,
        [newHelpCenter.subdomain, shouldDisplayFormErrors]
    )

    const subdomainError = useMemo(() => {
        const checkSubdomainOnCreate = !isUpdate && newHelpCenter.subdomain
        const checkSubdomainOnUpdate = isUpdate && !isPristineSubdomain

        return shouldDisplayFormErrors &&
            (checkSubdomainOnCreate || checkSubdomainOnUpdate)
            ? getSubdomainValidationError(
                  newHelpCenter.subdomain,
                  isSubdomainAvailable
              )
            : null
    }, [
        isUpdate,
        isPristineSubdomain,
        isSubdomainAvailable,
        shouldDisplayFormErrors,
        newHelpCenter.subdomain,
    ])

    const isInvalidForm = useMemo(() => {
        const isNameInvalid = !newHelpCenter.name
        const isSubdomainInvalidOnCreate =
            !isUpdate && newHelpCenter.subdomain && !isSubdomainAvailable
        const isSubdomainInvalidOnUpdate =
            isUpdate && !isPristineSubdomain && !isSubdomainAvailable
        const isShopNameInvalid = isStoreRequired && !newHelpCenter.shopName

        return (
            isNameInvalid ||
            isSubdomainInvalidOnCreate ||
            isSubdomainInvalidOnUpdate ||
            isShopNameInvalid
        )
    }, [
        newHelpCenter.name,
        newHelpCenter.subdomain,
        newHelpCenter.shopName,
        isUpdate,
        isSubdomainAvailable,
        isPristineSubdomain,
        isStoreRequired,
    ])

    const handleNameChange = (name: string) => {
        setIsPristine(false)

        if (!newHelpCenter.subdomain) {
            setPristineSubdomain(true)
        }

        const subdomain =
            !isUpdate && (isPristineSubdomain || !newHelpCenter.subdomain)
                ? slugify(name)
                : newHelpCenter.subdomain
        updateBasicsData({name, subdomain})
    }

    const handleSubdomainChange = (subdomain: string) => {
        setIsPristine(false)
        setPristineSubdomain(subdomain === helpCenter?.subdomain)
        updateBasicsData({subdomain})
    }

    const handleLanguageChange = (languages: Language[]) => {
        const {defaultLocale, supportedLocales} =
            mapLanguagePickerToHelpCenterLanguages(languages)
        updateBasicsData({defaultLocale, supportedLocales})
    }

    const handlePlatformTypeChange = (platformType: PlatformType) => {
        setIsPristine(false)
        updateBasicsData({platformType})
    }

    const handleStoreChange = (storeIntegrationName: string) => {
        setIsPristine(false)
        updateBasicsData({
            shopName: storeIntegrationName,
        })
    }

    const onFooterAction = (buttonClicked: FOOTER_BUTTONS) => {
        if (buttonClicked !== FOOTER_BUTTONS.CANCEL) {
            setShouldDisplayFormErrors(isInvalidForm)
        }
        setIsPristine(!isInvalidForm)
        switch (buttonClicked) {
            case FOOTER_BUTTONS.CANCEL:
                history.push('/app/settings/help-center')
                break
            case FOOTER_BUTTONS.CREATE_AND_CUSTOMIZE:
                !isInvalidForm &&
                    onSave(
                        NEXT_ACTION.NEW_WIZARD,
                        HelpCenterCreationWizardStep.Branding
                    )
                break
            case FOOTER_BUTTONS.NEXT:
                !isInvalidForm &&
                    onSave(
                        NEXT_ACTION.NEXT_STEP,
                        HelpCenterCreationWizardStep.Branding
                    )
                break
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                !isInvalidForm &&
                    onSave(
                        NEXT_ACTION.BACK_HOME,
                        HelpCenterCreationWizardStep.Basics
                    )
                break
            default:
                break
        }
    }

    return (
        <>
            <DiscardNewHelpCenterPrompt when={!isUpdate && !isPristine} />
            <UnsavedChangesPrompt
                onSave={() =>
                    onFooterAction(FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER)
                }
                when={isUpdate && !isPristine && !isLoading}
            />
            <WizardStepSkeleton
                step={HelpCenterCreationWizardStep.Basics}
                labels={HELP_CENTER_STEPS_LABELS}
                titles={HELP_CENTER_STEPS_TITLES}
                descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displayCancelButton={!isUpdate}
                        displayCreateAndCustomizeButton={!isUpdate}
                        displaySaveAndCustomizeLater={isUpdate}
                        displayNextButton={isUpdate}
                        onClick={onFooterAction}
                        isDisabled={isLoading}
                    />
                }
            >
                <div className={css.basicStepContainer}>
                    <div className={css.brandContainer}>
                        <div>
                            <Label
                                className={css.label}
                                isRequired
                                htmlFor="name"
                            >
                                Brand name
                            </Label>
                            <IconTooltip className={css.iconTooltip}>
                                Displayed in search engines and when your logo
                                is unavailable.
                            </IconTooltip>
                            <InputField
                                id="name"
                                data-testid="name"
                                type="text"
                                name="name"
                                placeholder="e.g. Gorgias"
                                isRequired
                                value={newHelpCenter.name}
                                onChange={handleNameChange}
                                error={
                                    shouldDisplayFormErrors &&
                                    !newHelpCenter.name
                                        ? 'This field is required.'
                                        : ''
                                }
                            />
                        </div>
                        <div>
                            <Label className={css.label} htmlFor="subdomain">
                                Subdomain
                            </Label>
                            <IconTooltip className={css.iconTooltip}>
                                This is the URL of your Help Center. If you
                                don't provide a value, we will generate one for
                                you.
                            </IconTooltip>
                            <InputGroup hasError={!!subdomainError}>
                                <TextInput
                                    id="subdomain"
                                    className={css.subdomainInput}
                                    placeholder="support"
                                    value={newHelpCenter.subdomain}
                                    onChange={handleSubdomainChange}
                                />
                                <GroupAddon>{HELP_CENTER_DOMAIN}</GroupAddon>
                            </InputGroup>
                            {shouldDisplayFormErrors && (
                                <div className={css.error}>
                                    {subdomainError}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label className={css.label} isRequired>
                            Default language
                        </Label>
                        <IconTooltip className={css.iconTooltip}>
                            Used whenever the customer's language is not
                            automatically detected or unavailable.
                        </IconTooltip>
                        <LanguagePicker
                            languages={languagePickerLanguages}
                            availableLanguages={uiLanguageOptions}
                            onSelectLanguageChange={handleLanguageChange}
                        />
                    </div>

                    <div>
                        {!isAutomate && (
                            <>
                                <div className={css.sectionHeading}>
                                    Select a platform type
                                </div>
                                <div className={css.radioButtonGroup}>
                                    <PreviewRadioButton
                                        value="ecommerce"
                                        isSelected={
                                            newHelpCenter.platformType ===
                                            PlatformType.ECOMMERCE
                                        }
                                        label="Ecommerce platforms"
                                        caption="Shopify, Magento, BigCommerce"
                                        onClick={() =>
                                            handlePlatformTypeChange(
                                                PlatformType.ECOMMERCE
                                            )
                                        }
                                    />
                                    <PreviewRadioButton
                                        value="website"
                                        isSelected={
                                            newHelpCenter.platformType ===
                                            PlatformType.WEBSITE
                                        }
                                        label="Any other website"
                                        caption="Websites, knowledge bases, etc."
                                        onClick={() =>
                                            handlePlatformTypeChange(
                                                PlatformType.WEBSITE
                                            )
                                        }
                                    />
                                </div>
                            </>
                        )}

                        <Label isRequired={isStoreRequired}>
                            Connect a store
                        </Label>
                        <div className={css.connectStoreDescription}>
                            {isAutomate
                                ? 'Connect a store to use Automate features and to enable auto-embedding to your website.'
                                : newHelpCenter.platformType ===
                                  PlatformType.ECOMMERCE
                                ? 'Connect a store to enable auto-embedding (Shopify only) to your website.'
                                : ''}
                        </div>
                        <SelectField
                            fullWidth
                            placeholder="Select a store"
                            customIcon={
                                !newHelpCenter.shopName && (
                                    <img
                                        src={store}
                                        className={css['storeIcon']}
                                        alt="store logo"
                                    />
                                )
                            }
                            value={newHelpCenter?.shopName}
                            onChange={(value) => {
                                handleStoreChange(value as string)
                            }}
                            options={integrationOptions}
                            showSelectedOption={
                                allStoreIntegrations.length === 1
                            }
                            isSearchable={false}
                        />
                        {shouldDisplayFormErrors && !newHelpCenter.shopName && (
                            <div className={css.error}>
                                This field is required.
                            </div>
                        )}
                    </div>
                </div>
            </WizardStepSkeleton>
        </>
    )
}

export default HelpCenterCreationWizardStepBasics
