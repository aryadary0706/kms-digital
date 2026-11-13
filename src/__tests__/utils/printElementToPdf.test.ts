import { describe, expect, test, vi, beforeEach } from 'vitest';

const saveMock = vi.fn(() => Promise.resolve());
const fromMock = vi.fn(() => ({ save: saveMock }));
const setMock = vi.fn(() => ({ from: fromMock }));
const html2pdfMock = vi.fn(() => ({ set: setMock }));

vi.mock('html2pdf.js', () => ({ default: html2pdfMock }));

import { printElementToPdf } from '../../utils/printElementToPdf';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('printElementToPdf', () => {
  test('throws when element is null', async () => {
    await expect(printElementToPdf(null, 'x.pdf')).rejects.toThrow();
  });

  test('calls html2pdf with element and filename then downloads', async () => {
    const el = document.createElement('div');
    await printElementToPdf(el, 'Kartu.pdf');
    expect(html2pdfMock).toHaveBeenCalledTimes(1);
    const [opt] = setMock.mock.calls[0] as unknown as [{ filename: string }];
    expect(opt.filename).toBe('Kartu.pdf');
    expect(fromMock).toHaveBeenCalledWith(el);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});
