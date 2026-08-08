import{c as l}from"./createLucideIcon-CnROm-H8.js";import{j as n,P as s}from"./index-DdtwIknz.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=l("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);function o(e){return e?e.split(" ").filter(Boolean).slice(0,2).map(r=>{var t;return(t=r[0])==null?void 0:t.toUpperCase()}).join(""):"BF"}function p({name:e,src:r,size:t="md",className:a=""}){const i={sm:"h-9 w-9 text-xs",md:"h-11 w-11 text-sm",lg:"h-14 w-14 text-base"};return r?n.jsx("img",{src:r,alt:e||"Avatar",className:`rounded-full object-cover ${i[t]} ${a}`}):n.jsx("span",{className:`inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${i[t]} ${a}`,"aria-label":e||"Avatar",children:o(e)})}p.propTypes={name:s.string,src:s.string,size:s.oneOf(["sm","md","lg"]),className:s.string};export{p as A,u as T};
