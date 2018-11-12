export const renderChatCodeSnippet = (integration) => {
    return `<!-- Gorgias Chat Widget Start -->
<div id="gorgias-chat">
<script>window.gorgiasChatParameters = {}</script>
<script src="${integration.getIn(['meta', 'script_url'])}" defer></script>
</div>
<!-- Gorgias Chat Widget End -->`
}

export const renderFacebookCodeSnippet = (integration) => {
    return `<!-- Gorgias Messenger Widget Start -->
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId            : '1751254291756263',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v2.12'
    });
    FB.AppEvents.logPageView();
  };

  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
</script>

<div class="fb-customerchat"
     page_id="${integration.getIn(['facebook', 'page_id'])}"
     minimized="false"
     ref="g"
>
</div>
<!-- Gorgias Messenger Widget End -->`
}
