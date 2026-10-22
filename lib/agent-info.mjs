import {businessBrand,brands} from './operations.mjs';

const definition={bytova:{name:'Alex',slug:'alex'},rruk:{name:'Pixel',slug:'pixel'},garden:{name:'Sprig',slug:'sprig'}}[businessBrand];
if(!definition)throw new Error('Unknown agent business.');
export const agentName=definition.name;
export const agentSlug=definition.slug;
export const agentBusiness=brands[businessBrand].name;
export const agentStatuses=['new','in_progress','awaiting_customer','completed','closed'];
