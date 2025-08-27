type Option = { value: string; label: string };

export function createA11ySelect(
  mount: HTMLElement,
  options: Option[],
  onChange: (value: string) => void,
  initial?: string
) {
  let open = false;
  let active = 0;
  const value = () => options[active]?.value ?? '';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'focus-ring rounded-md px-3 py-2 border border-slate-600 bg-transparent text-sm w-full flex justify-between items-center';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');

  const list = document.createElement('div');
  list.className = 'mt-1 rounded-md border border-slate-600 bg-slate-900 shadow-xl max-h-60 overflow-auto hidden';
  list.setAttribute('role', 'listbox');

  function sync() {
    btn.textContent = options[active]?.label ?? 'Select';
    btn.setAttribute('aria-expanded', String(open));
    list.classList.toggle('hidden', !open);
    ;(Array.from(list.children) as HTMLElement[]).forEach((el, i) => {
      el.setAttribute('aria-selected', String(i === active));
      el.className = 'px-3 py-2 text-sm hover:bg-slate-700 ' + (i === active ? 'bg-slate-700' : '');
    });
  }

  options.forEach((opt, i) => {
    const row = document.createElement('div');
    row.setAttribute('role', 'option');
    row.dataset.value = opt.value;
    row.textContent = opt.label;
    row.addEventListener('click', () => { active = i; open = false; onChange(value()); sync(); });
    list.appendChild(row);
  });

  btn.addEventListener('click', () => { open = !open; sync(); if (open) list.focus(); });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(options.length - 1, active + 1); sync(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); sync(); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open = !open; sync(); }
  });

  if (initial) {
    const idx = options.findIndex(o => o.value === initial);
    if (idx >= 0) active = idx;
  }
  sync();

  mount.appendChild(btn);
  mount.appendChild(list);

  return { get value() { return value(); } };
}

