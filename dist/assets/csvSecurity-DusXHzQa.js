const r=/^[=+\-@]/u;function c(t){const e=String(t??"");if(!e)return e;const n=e.replace(/^[\t\r ]+/u,"");return r.test(n)?`'${e}`:e}function i(t){return`"${c(t).replace(/"/g,'""')}"`}export{i as c};
