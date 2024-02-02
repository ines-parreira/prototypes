import linkifyIt from 'linkify-it'

// note that 2 letters tlds are automatically interpreted
const tlds =
    'com edu gov ru org net de jp uk br it pl in fr au ir nl info cn es cz kr ca ua eu co gr za ro biz ch se io'.split(
        ' '
    )
export const linkify = linkifyIt().tlds(tlds)
