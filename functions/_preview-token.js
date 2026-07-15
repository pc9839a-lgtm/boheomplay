export function decodePreviewToken(token=''){
  try{
    const value=String(token).replace(/-/g,'+').replace(/_/g,'/');
    const binary=atob(value+'='.repeat((4-value.length%4)%4));
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
    const data=JSON.parse(new TextDecoder().decode(bytes));
    return data&&typeof data==='object'&&!Array.isArray(data)?data:null;
  }catch(error){return null;}
}
