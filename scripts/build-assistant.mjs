import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const {build}=createRequire(realpathSync(fileURLToPath(import.meta.resolve('vite'))))('esbuild');
await build({entryPoints:['client/customer-assistant.mjs'],bundle:true,format:'iife',platform:'browser',target:['es2022'],minify:true,loader:{'.css':'text'},outfile:'public/assistant.js',legalComments:'none'});
console.log('Built the customer conversation assistant.');
