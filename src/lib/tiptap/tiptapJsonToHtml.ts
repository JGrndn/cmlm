type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  attrs?: Record<string, unknown>;
};

function applyMarks(text: string, marks: TipTapNode['marks']): string {
  let result = text;
  for (const mark of marks ?? []) {
    if (mark.type === 'bold') result = `<strong>${result}</strong>`;
    else if (mark.type === 'italic') result = `<em>${result}</em>`;
    else if (mark.type === 'underline') result = `<u>${result}</u>`;
    else if (mark.type === 'strike') result = `<s>${result}</s>`;
    else if (mark.type === 'superscript') result = `<sup>${result}</sup>`;
    else if (mark.type === 'subscript') result = `<sub>${result}</sub>`;
    else if (mark.type === 'textStyle') {
      const color = mark.attrs?.color as string | undefined;
      if (color) result = `<span style="color:${color}">${result}</span>`;
    }
    else if (mark.type === 'highlight') {
      const color = (mark.attrs?.color as string | undefined) ?? 'yellow';
      result = `<mark style="background-color:${color}">${result}</mark>`;
    }
  }
  return result;
}

function inner(node: TipTapNode): string {
  return (node.content ?? []).map(renderNode).join('');
}

function renderNode(node: TipTapNode): string {
  const align = node.attrs?.textAlign as string | undefined;
  const alignStyle = align && align !== 'left' ? ` style="text-align:${align}"` : '';

  switch (node.type) {
    case 'doc':
      return inner(node);

    case 'paragraph':
      return `<p${alignStyle}>${inner(node) || '<br>'}</p>`;

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      return `<h${level}${alignStyle}>${inner(node)}</h${level}>`;
    }

    case 'text':
      return applyMarks(node.text ?? '', node.marks);

    case 'bulletList':
      return `<ul>${inner(node)}</ul>`;

    case 'orderedList':
      return `<ol>${inner(node)}</ol>`;

    case 'listItem':
      return `<li>${inner(node)}</li>`;

    case 'taskList':
      return `<ul class="task-list" style="list-style:none;padding-left:0">${inner(node)}</ul>`;

    case 'taskItem': {
      const checked = node.attrs?.checked ? 'checked' : '';
      return `<li style="display:flex;gap:0.5em;align-items:flex-start"><input type="checkbox" disabled ${checked} style="margin-top:0.2em">${inner(node)}</li>`;
    }

    case 'table':
      return `<table style="border-collapse:collapse;width:100%">${inner(node)}</table>`;

    case 'tableRow':
      return `<tr>${inner(node)}</tr>`;

    case 'tableHeader':
      return `<th style="border:1px solid #d1d5db;padding:0.4em 0.6em;background:#f9fafb;font-weight:600;text-align:left">${inner(node)}</th>`;

    case 'tableCell':
      return `<td style="border:1px solid #d1d5db;padding:0.4em 0.6em">${inner(node)}</td>`;

    case 'image': {
      const src = node.attrs?.src as string ?? '';
      const alt = node.attrs?.alt as string ?? '';
      return `<img src="${src}" alt="${alt}" style="max-width:100%">`;
    }

    case 'horizontalRule':
      return '<hr>';

    case 'hardBreak':
      return '<br>';

    default:
      return inner(node);
  }
}

export function tiptapJsonToHtml(json: Record<string, unknown>): string {
  if (!json || typeof json !== 'object') return '';
  return renderNode(json as TipTapNode);
}
