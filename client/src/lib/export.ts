import { fmtDate } from './format';

const save = (blob: Blob, file: string) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file; a.click(); URL.revokeObjectURL(a.href);
};

export async function downloadPdf(title: string, head: string[], body: string[][], file: string) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14); doc.text('Apple Wood Furnitures - ' + title, 14, 14);
  doc.setFontSize(9); doc.text('Generated ' + fmtDate(new Date().toISOString()), 14, 20);
  autoTable(doc, { head: [head], body, startY: 25, styles: { fontSize: 8 }, headStyles: { fillColor: [33, 55, 45] } });
  doc.save(file);
}

export async function downloadDocx(title: string, head: string[], body: string[][], file: string) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, PageOrientation, ShadingType } = await import('docx');
  const cell = (t: string, header: boolean) => new TableCell({
    shading: header ? { type: ShadingType.CLEAR, fill: '21372D', color: 'auto' } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: header, size: 16, color: header ? 'FFFFFF' : '000000' })] })],
  });
  const doc = new Document({ sections: [{
    properties: { page: { size: { orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
    children: [
      new Paragraph({ children: [new TextRun({ text: 'Apple Wood Furnitures - ' + title, bold: true, size: 28 })] }),
      new Paragraph({ children: [new TextRun({ text: 'Generated ' + fmtDate(new Date().toISOString()), size: 18 })], spacing: { after: 200 } }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
        new TableRow({ tableHeader: true, children: head.map((h) => cell(h, true)) }),
        ...body.map((r) => new TableRow({ children: r.map((c) => cell(c, false)) })),
      ] }),
    ] }] });
  save(await Packer.toBlob(doc), file);
}

export function downloadCsv(head: string[], body: string[][], file: string) {
  const esc = (v: string) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  save(new Blob(['﻿' + [head, ...body].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }), file);
}
