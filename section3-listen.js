import {loadSection} from './ui-common.js';
export async function mount(container){
  await loadSection(container, 'section3-listen.html');
}
