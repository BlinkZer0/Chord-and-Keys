import {loadSection} from './ui-common.js';
export async function mount(container){
  await loadSection(container, 'section1-explorer.html');
}
