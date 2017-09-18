export const renderCodeSnippet = (integration) => {
    let snippet = '<!-- Gorgias Chat Widget Start -->\n'
    snippet += '<div id="gorgias-chat">\n'
    snippet += '<script>window.gorgiasChatParameters = {}</script>\n'
    snippet += `<script src="${integration.getIn(['meta', 'script_url'])}" defer></script>\n`
    snippet += '</div>\n'
    snippet += '<!-- Gorgias Chat Widget End -->'

    return snippet
}
