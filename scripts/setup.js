export default `
(function () {

  window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
  };

  window.rnOnLogout = function(authorizationHeader) {
    window.postMessage(JSON.stringify({ type: 'logout', authorization: authorizationHeader }));
  }

  window.rnOnLogin = function(authorizationHeader) {
    window.postMessage(JSON.stringify({ type: 'login', authorization: authorizationHeader }));
  }

}());

const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);
`;
