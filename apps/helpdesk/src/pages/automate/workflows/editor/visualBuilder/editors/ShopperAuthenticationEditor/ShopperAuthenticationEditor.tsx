import React, { useState } from 'react'

import classNames from 'classnames'

import { Label } from '@gorgias/merchant-ui-kit'

import { THEME_NAME } from 'core/theme'
import InputField from 'gorgias-design-system/Input/TextField'
import { ShopperAuthenticationNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'
import RadioButton from 'pages/common/components/RadioButton'
import Caption from 'pages/common/forms/Caption/Caption'

import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'

import css from '../NodeEditor.less'
import shopperAuthenticationCss from './ShopperAuthenticationEditor.less'

export default function ShopperAuthenticationEditor({
    nodeInEdition,
}: {
    nodeInEdition: ShopperAuthenticationNodeType
}) {
    const [selectedOption, setSelectedOption] = useState('email')
    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div>
                        <div
                            className={classNames(
                                shopperAuthenticationCss.loginCard,
                                THEME_NAME.Light,
                            )}
                        >
                            <div
                                className={
                                    shopperAuthenticationCss.loginCardContent
                                }
                            >
                                <Label
                                    className={shopperAuthenticationCss.label}
                                >
                                    Sign In
                                </Label>

                                <div
                                    className={
                                        shopperAuthenticationCss.radioButtonsGroup
                                    }
                                >
                                    <RadioButton
                                        className={
                                            shopperAuthenticationCss.radioButton
                                        }
                                        value="email"
                                        label="Email"
                                        isSelected={selectedOption === 'email'}
                                        onChange={() =>
                                            setSelectedOption('email')
                                        }
                                    />
                                    <RadioButton
                                        className={
                                            shopperAuthenticationCss.radioButton
                                        }
                                        value="sms"
                                        label="SMS"
                                        isSelected={selectedOption === 'sms'}
                                        onChange={() =>
                                            setSelectedOption('sms')
                                        }
                                    />
                                </div>
                                <InputField
                                    id="email-input"
                                    label="Your email"
                                    placeholder="Enter email"
                                    isValid
                                    value="john.smith@google.com"
                                />
                            </div>
                        </div>
                        <Caption>
                            If a customer is not already signed in, they will be
                            asked to provide an email address or phone number
                            and verify with a code before they can proceed to
                            the next step.
                        </Caption>
                    </div>
                </div>
            </Drawer.Content>
        </>
    )
}
