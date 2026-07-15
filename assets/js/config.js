window.APP_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/AKfycbxCtjwoWhUyi1HxD93HfS_09umPz_kNDj0fp-necgFH37LU5JbkMnS3IZFxSDAZbeVWzw/exec',
  submitTimeout: 30000
};

(function loadQuestionEnhancements(){
  [
    '/assets/js/consent-all.js?v=20260715-v2'
  ].forEach((src)=>{
    if(document.querySelector(`script[src^="${src.split('?')[0]}"]`)) return;
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    document.head.appendChild(script);
  });
})();
