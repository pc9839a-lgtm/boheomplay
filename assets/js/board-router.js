(function(){
  const PAGE_SIZE=20;
  const STORAGE_KEY='boheomplay_board_posts_v2';
  const PURGE_MARKER='boheomplay_manual_posts_purged_20260715_v3';
  let visibleCount=PAGE_SIZE;
  let activeFilter='전체';
  let posts=[];

  const esc=(value)=>String(value??'').replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function encode(value){
    const bytes=new TextEncoder().encode(JSON.stringify(value));
    let binary='';
    for(const byte of bytes) binary+=String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
  }

  function normalize(post={}){
    return {
      id:String(post.id||post.slug||post.href||post.title||''),
      slug:String(post.slug||''),
      no:String(post.no||'').trim()||'NEW',
      category:String(post.category||'기타'),
      title:String(post.title||''),
      message:String(post.message||''),
      answer:String(post.answer||''),
      nickname:String(post.nickname||'익명'),
      status:String(post.status||(post.answer?'답변완료':'답변대기')),
      time:String(post.time||''),
      href:String(post.href||'')
    };
  }

  function isPrivate(post){return post.title==='비공개 질문입니다.'||post.nickname==='비공개';}

  function isStaleManualPost(post){
    const item=normalize(post);
    return item.no==='NEW'||item.id.startsWith('local-')||item.slug.startsWith('local-')||item.href.includes('/q/local-preview');
  }

  function hrefFor(post){
    if(post.href&&post.href!=='#board') return post.href;
    if(isPrivate(post)||!post.title||!post.message) return '';
    const token=encode({id:post.id||post.slug,category:post.category,title:post.title,message:post.message,nickname:post.nickname||'익명'});
    return `/q/local-preview?d=${encodeURIComponent(token)}`;
  }

  function merge(...groups){
    const seen=new Set();
    return groups.flat().map(normalize).filter((post)=>{
      const key=post.slug||post.id||post.href||post.title;
      if(!key||seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function purgeLocalManualPosts(){
    try{
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(PURGE_MARKER,'1');
    }catch(error){
      // Storage may be unavailable in private browsing mode.
    }
  }

  function domPosts(list){
    return Array.from(list.querySelectorAll('.board-item')).map((item)=>{
      const row=item.querySelector('.board-row');
      if(!row) return null;
      return normalize({
        id:row.getAttribute('href')||row.dataset.postToggle||item.querySelector('.board-title')?.textContent||'',
        no:item.querySelector('.board-no')?.textContent||'',
        category:item.querySelector('.board-category')?.textContent||'기타',
        title:item.querySelector('.board-title')?.textContent||'',
        status:item.querySelector('.board-status')?.textContent||'답변대기',
        time:item.querySelector('.board-date')?.textContent||'',
        href:row.tagName==='A'?row.getAttribute('href')||'':'',
        message:item.querySelector('.board-detail>.detail-text')?.textContent||'',
        answer:item.querySelector('.answer-block .detail-text:not(.answer-empty)')?.textContent||''
      });
    }).filter(Boolean).filter((post)=>!isStaleManualPost(post));
  }

  function filtered(){
    if(activeFilter==='전체') return posts;
    if(activeFilter==='보험료') return posts.filter((post)=>post.category==='보험료'||post.category==='보험료 줄이기');
    if(activeFilter==='태아보험') return posts.filter((post)=>post.category==='태아보험'||post.category==='태아·어린이보험');
    return posts.filter((post)=>post.category===activeFilter);
  }

  function row(post){
    const answered=post.status==='답변완료'||Boolean(post.answer);
    const content=`<span class="board-no${post.no==='NEW'?' is-new':''}">${esc(post.no)}</span><span class="board-category">${esc(post.category)}</span><span class="board-title">${esc(post.title)}</span><span class="board-status ${answered?'':'waiting'}">${answered?'답변완료':'답변대기'}</span><span class="board-date">${esc(post.time)}</span>`;
    const href=hrefFor(post);
    return href?`<article class="board-item"><a class="board-row" href="${esc(href)}">${content}</a></article>`:`<article class="board-item"><div class="board-row board-row-disabled" aria-disabled="true">${content}</div></article>`;
  }

  function render(list){
    const selected=filtered();
    const visible=selected.slice(0,visibleCount);
    list.innerHTML=visible.length?visible.map(row).join(''):'<div class="board-empty">등록된 질문이 없습니다.</div>';
    const more=document.getElementById('boardMoreWrap');
    if(more) more.hidden=visible.length>=selected.length;
  }

  function addMore(list){
    document.getElementById('boardMoreWrap')?.remove();
    const wrap=document.createElement('div');
    wrap.id='boardMoreWrap';
    wrap.className='board-more-wrap';
    wrap.innerHTML='<button id="boardMoreButton" class="board-more-button" type="button">더보기</button>';
    (list.closest('.board-table')||list).insertAdjacentElement('afterend',wrap);
    wrap.addEventListener('click',(event)=>{
      if(!event.target.closest('#boardMoreButton')) return;
      visibleCount+=PAGE_SIZE;
      render(list);
    });
  }

  function addStyles(){
    if(document.getElementById('boardRouterStyles')) return;
    const style=document.createElement('style');
    style.id='boardRouterStyles';
    style.textContent='.board-row-disabled{cursor:default}.board-no.is-new{font-size:11px;font-weight:950;letter-spacing:.04em}.board-more-wrap{display:flex;justify-content:center;padding:28px 0 0}.board-more-wrap[hidden]{display:none!important}.board-more-button{min-width:210px;height:56px;padding:0 28px;border:1px solid #111;border-radius:999px;background:#fff;color:#111;font:inherit;font-size:16px;font-weight:900;cursor:pointer}.board-more-button:hover{background:#111;color:#fff}@media(max-width:640px){.board-more-button{width:100%;height:54px}}';
    document.head.appendChild(style);
  }

  async function init(){
    const old=document.getElementById('boardList');
    if(!old||old.dataset.routerReady==='true') return;

    purgeLocalManualPosts();
    const initial=domPosts(old);
    const list=old.cloneNode(true);
    list.dataset.routerReady='true';
    old.replaceWith(list);
    addStyles();
    addMore(list);

    document.getElementById('boardTabs')?.addEventListener('click',(event)=>{
      const button=event.target.closest('[data-filter]');
      if(!button) return;
      activeFilter=button.dataset.filter||'전체';
      visibleCount=PAGE_SIZE;
      setTimeout(()=>render(list),0);
    });

    try{
      const response=await fetch('/api/board-posts',{method:'GET',cache:'no-store'});
      const data=await response.json();
      const remote=response.ok&&data.ok&&Array.isArray(data.posts)?data.posts:[];
      posts=merge(remote.filter((post)=>!isStaleManualPost(post)),initial);
    }catch(error){
      posts=merge(initial);
    }
    render(list);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();