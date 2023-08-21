export const gorgiasColors = {
    primary: '#115cb5',
    dark: '#161616',
    grey: '#A7ABC5',
    hoverColor: '#E8F1FE',
    focusRingColor: '#c8e0ff',
    white: '#fff',

    secondaryNavy: '#152065',
    secondaryRed: '#f24f66',
    secondaryGreen: '#24d69d',
    secondaryOrange: '#fd9b5a',
    secondaryPurple: '#8088d6',
    secondaryLight: '#f9f9f9',
    secondaryDark: '#ddd',

    neutral10: '#1d365c',
    neutral9: '#2d4366',
    neutral8: '#556885',
    neutral7: '#8390a5',
    neutral6: '#99a5b6',
    neutral5: '#bbc3ce',
    neutral4: '#d2d7de',
    neutral3: '#dde1e7',
    neutral2: '#e8ebef',
    neutral1: '#f4f5f7',
    neutral0: '#fcfcfc',

    neutralGrey0: '#fff',
    neutralGrey1: '#f9f9f9',
    neutralGrey2: '#eeeeee',
    neutralGrey3: '#dddddd',
    neutralGrey4: '#afafaf',
    neutralGrey5: '#6a6a6a',
    neutralGrey6: '#161616',

    supportingBlue9: '#115cb5',
    supportingBlue8: '#2c5390',
    supportingBlue7: '#3067c0',
    supportingBlue6: '#3373db',
    supportingBlue5: '#5c98fa',
    supportingBlue4: '#77a9fa',
    supportingBlue3: '#9bc0fc',
    supportingBlue2: '#d2e2fd',
    supportingBlue1: '#e4eefe',
    supportingBlue0: '#f6f9ff',

    supportingRed8: '#7b2323',
    supportingRed7: '#a32e2e',
    supportingRed6: '#d6384d',
    supportingRed5: '#f4697d',
    supportingRed4: '#f68494',
    supportingRed3: '#f89eab',
    supportingRed2: '#fab9c2',
    supportingRed1: '#fde5e8',
    supportingRed0: '#fef6f7',

    supportingYellow8: '#9b6f36',
    supportingYellow7: '#e69d3d',
    supportingYellow6: '#fdab40',
    supportingYellow5: '#febd69',
    supportingYellow4: '#fec882',
    supportingYellow3: '#fed7a3',
    supportingYellow2: '#ffedd5',
    supportingYellow1: '#fff4e6',
    supportingYellow0: '#fffbf7',

    supportingGreen8: '#12694d',
    supportingGreen7: '#1a9970',
    supportingGreen6: '#20c08c',
    supportingGreen5: '#3adaa7',
    supportingGreen4: '#66e2bb',
    supportingGreen3: '#87e8c9',
    supportingGreen2: '#a8eed8',
    supportingGreen1: '#def9f0',
    supportingGreen0: '#f4fdfa',

    accessoryBlue: '#EAF1FF',
    accessoryPink: '#FAEAFF',
    accessoryYellow: '#FFFDEA',
    accessoryGrey: '#F9F9F9',
    accessoryTeal: '#EAFFFE',
    accessoryGreen: '#EAFFEF',
    accessoryOrange: '#FFF3EA',
    accessoryPurple: '#EDEAFF',
    accessoryRed: '#FFEAEA',
    accessoryBlack: '#DDDDDD',

    accessoryBlueText: '#115CB5',
    accessoryPinkText: '#9411B5',
    accessoryYellowText: '#8A6800',
    accessoryGreyText: '#6A6A6A',
    accessoryTealText: '#004D79',
    accessoryGreenText: '#00796B',
    accessoryOrangeText: '#793A00',
    accessoryPurpleText: '#000C79',
    accessoryRedText: '#A32E2E',
    accessoryBlackText: '#161616',

    shopify: '#95bf46',
    hubspot: '#f8761f',
    recharge: '#53bad3',
    hdoc: '#f44599',
    smile: '#fbc335',
    stripe: '#6875e2',
}
export type ColorType = keyof typeof gorgiasColors

export const generateRootCssColors = () => {
    let cssRules = ''
    Object.keys(gorgiasColors).forEach((colorName) => {
        cssRules = `${cssRules} --${colorName}: ${
            gorgiasColors[colorName as ColorType]
        };`
    })
    return `:root { ${cssRules} }`
}

export const focusHighlightCss = `
    border-color: var(--primary);
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
`
