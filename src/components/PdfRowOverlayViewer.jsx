
'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';

const PdfPageWithOverlay = ({ pdf, pageNumber, scale, rows, selectedRowIds, onToggleRow, showCheckboxes }) => {
  const canvasRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [pagePdfSize, setPagePdfSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;

    const renderPage = async () => {
      if (!pdf) return;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const baseViewport = page.getViewport({ scale: 1 });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');

      // Render sharply on HiDPI screens
      const outputScale = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

      setViewportSize({ width: viewport.width, height: viewport.height });
      setPagePdfSize({ width: baseViewport.width, height: baseViewport.height });

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      await page.render(renderContext).promise;
      if (cancelled) return;
    };

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, scale]);

  const overlayPositions = useMemo(() => {
    // MANDATORY mapping (PDFBox -> Browser): browserY = (pageHeight - pdfY) * scale
    // Prefer backend-provided pageHeight; fallback to PDF.js base viewport height.
    const pdfHeight =
      (rows && rows.length > 0 && typeof rows[0]?.pageHeight === 'number' ? rows[0].pageHeight : pagePdfSize.height) ||
      0;

    // X placement: right-most table column (cover the red dot). Without backend X,
    // place near the right edge of the rendered page.
    const leftPx = Math.max(0, viewportSize.width - 22);

    if (!pdfHeight || !viewportSize.height) return [];

    return (rows || []).map((row) => {
      const topPx = (pdfHeight - Number(row.yPosition || 0)) * scale;
      return {
        rowId: row.rowId,
        left: leftPx,
        top: Math.max(0, topPx - 7),
      };
    });
  }, [rows, pagePdfSize.height, viewportSize.width, viewportSize.height, scale]);

  return (
    <div className="relative mb-4 flex justify-center">
      <canvas ref={canvasRef} className="block" />
      {showCheckboxes && viewportSize.width > 0 && viewportSize.height > 0 && (
        <div
          className="absolute top-0 left-0"
          // Keep overlay attached to this page so it scrolls together with the page
          style={{
            width: viewportSize.width,
            height: viewportSize.height,
            pointerEvents: 'none',
          }}
        >
          {overlayPositions.map((pos) => (
            <div
              key={pos.rowId}
              style={{
                position: 'absolute',
                left: `${pos.left}px`,
                top: `${pos.top}px`,
                pointerEvents: 'auto',
              }}
            >
              <input
                type="checkbox"
                style={{ pointerEvents: 'auto' }}
                className="h-4 w-4 cursor-pointer accent-indigo-600 bg-white border border-gray-300 rounded"
                checked={selectedRowIds.includes(pos.rowId)}
                onChange={(e) => onToggleRow(pos.rowId, e.target.checked)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PdfRowOverlayViewer = ({ pdfUrl, rows, selectedRowIds, onToggleRow, initialScale = 1.1, showCheckboxes = true }) => {
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(initialScale);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      if (!pdfUrl) return;
      try {
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        // Worker file is served from public/pdf.worker.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages || 0);
      } catch (err) {
        console.error('Error loading PDF for overlay viewer:', err);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // Reset selection when URL changes
  useEffect(() => {
    if (!pdfUrl && pdfDoc) {
      setPdfDoc(null);
      setNumPages(0);
    }
  }, [pdfUrl, pdfDoc]);

  const rowsByPage = useMemo(() => {
    const map = new Map();
    (rows || []).forEach((row) => {
      const page = row.pageNumber || 1;
      if (!map.has(page)) map.set(page, []);
      map.get(page).push(row);
    });
    return map;
  }, [rows]);

  if (!pdfUrl) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>Zoom:</span>
          <button
            type="button"
            className="px-2 py-0.5 border border-gray-300 rounded text-xs"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
          >
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className="px-2 py-0.5 border border-gray-300 rounded text-xs"
            onClick={() => setScale((s) => Math.min(3, s + 0.1))}
          >
            +
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto px-3 py-2 bg-gray-50">
        {pdfDoc && numPages > 0 && (
          <div className="flex flex-col items-center">
            {Array.from({ length: numPages }, (_, idx) => {
              const pageNumber = idx + 1;
              const pageRows = rowsByPage.get(pageNumber) || [];
              return (
                <PdfPageWithOverlay
                  key={pageNumber}
                  pdf={pdfDoc}
                  pageNumber={pageNumber}
                  scale={scale}
                  rows={pageRows}
                  selectedRowIds={selectedRowIds}
                  onToggleRow={onToggleRow}
                  showCheckboxes={showCheckboxes}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfRowOverlayViewer;
