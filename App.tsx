
import React, { useState } from 'react';
import { parseAbstract } from './geminiService';
import { PosterData, AppStatus, PosterConfig, ColorPalette, PosterStyle, PosterFormat, ChartType } from './types';
import PosterLayout from './components/PosterLayout';
import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PALETTES_PREVIEW: Record<string, string> = {
  'medical-blue': '#003060',
  'clinical-green': '#004d40',
  'modern-purple': '#4a148c',
  'slate-gray': '#334155',
  'deep-red': '#7f1d1d',
  'ocean-teal': '#006064',
  'vibrant-orange': '#e65100',
  'sky-blue': '#0ea5e9',
  'royal-gold': '#827717',
  'carbon-black': '#212121'
};

const PALETTES = {
  'medical-blue': { primary: '#003060', secondary: '#004d99', accent: '#e0f2fe' },
  'clinical-green': { primary: '#004d40', secondary: '#00695c', accent: '#e0f2f1' },
  'modern-purple': { primary: '#4a148c', secondary: '#7b1fa2', accent: '#f3e5f5' },
  'slate-gray': { primary: '#1e293b', secondary: '#475569', accent: '#f1f5f9' },
  'deep-red': { primary: '#7f1d1d', secondary: '#b91c1c', accent: '#fef2f2' },
  'ocean-teal': { primary: '#006064', secondary: '#00838f', accent: '#e0f7fa' },
  'vibrant-orange': { primary: '#e65100', secondary: '#f57c00', accent: '#fff3e0' },
  'sky-blue': { primary: '#0284c7', secondary: '#0369a1', accent: '#f0f9ff' },
  'royal-gold': { primary: '#33691e', secondary: '#827717', accent: '#f9fbe7' },
  'carbon-black': { primary: '#212121', secondary: '#424242', accent: '#f5f5f5' }
};

const CHART_COLORS = ['003f5c', '2f4b7c', '665191', 'a05195', 'd45087', 'f95d6a', 'ff7c43', 'ffa600'];

const App: React.FC = () => {
  const [abstract, setAbstract] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const [config, setConfig] = useState<PosterConfig>({
    palette: 'medical-blue',
    style: 'standard',
    format: 'A0-V',
    microChartType: 'radar',
    outcomeChartType: 'bar'
  });

  const handleGenerate = async () => {
    if (!abstract.trim()) return;
    setStatus(AppStatus.LOADING);
    setError(null);
    try {
      const data = await parseAbstract(abstract);
      setPosterData(data);
      setStatus(AppStatus.READY);
    } catch (err: any) {
      console.error(err);
      setError("Error al procesar el abstract clínico.");
      setStatus(AppStatus.ERROR);
    }
  };

  const loadExample = () => {
    setAbstract(`CANDIDURIA EN PACIENTES EN TRATAMIENTO CON INHIBIDORES DEL COTRANSPORTADOR SODIO-GLUCOSA TIPO 2 EN EL SERVICIO DE URGENCIAS.
    Autores: Ruiz Ramos, J; Monje López, AE; Plaza Díaz, A; Herrera Mateo, S; Hernández Ontiveros, H; Agra Montava, I; Juanes Borrego. Hospital Santa Cruz y San Pablo (Barcelona).
    Introducción y Objetivos: Los fármacos iSGLT-2 están asociados a infecciones urinarias por Cándida spp. El manejo es incierto. El objetivo fue evaluar el manejo en un SU de los aislamientos de Cándida en sedimentos de orina.
    Métodos: Estudio observacional retrospectivo (2022-2024). Se analizó reconsulta a 90 días y el impacto del tratamiento antifúngico (Test Ji-cuadrado).
    Resultados: 60 pacientes incluidos. Edad media 80.4 años. 63.3% hombres. 55% en tratamiento con empaglifozina y 45% con dapaglifozina. 33.3% recibieron fluconazol al alta. 6.7% suspendieron iSGLT2. Aislamientos: C. glabrata 55%, C. albicans 30%, C. tropicalis 10%, C. parapsilopsis 3%, C. krusei 2%. Reconsultas a 90 días: 26.1% con tratamiento vs 12.1% sin tratamiento (p=0.171). 
    Conclusiones: El aislamiento de Candida spp se asocia a prescripción frecuente de antifúngico, sin asociación significativa entre dicha prescripción y nuevos episodios de visitas a urgencias.`);
  };

  const exportToPDF = async () => {
    const posterElement = document.getElementById('poster-capture');
    if (!posterElement || !posterData) return;

    setIsExportingPDF(true);
    try {
      const canvas = await html2canvas(posterElement, {
        scale: 4, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        removeContainer: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const isHorizontal = config.format.includes('-H') || config.format === '16:9';
      
      let pdfW, pdfH;
      if (config.format.startsWith('A0')) {
        pdfW = isHorizontal ? 1189 : 841;
        pdfH = isHorizontal ? 841 : 1189;
      } else if (config.format === '16:9') {
        pdfW = 400; pdfH = 225;
      } else if (config.format === '9:16') {
        pdfW = 225; pdfH = 400;
      } else {
        pdfW = 841; pdfH = 1189;
      }

      const pdf = new jsPDF({
        orientation: isHorizontal ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfW, pdfH],
        compress: false
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      pdf.save(`Poster_A0_Alta_Resolucion_${posterData.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      setError("Error al generar el PDF de alta resolución.");
      console.error(err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getPpptxChartType = (type: ChartType): any => {
    switch(type) {
      case 'bar': return 'bar';
      case 'bar-h': return 'bar';
      case 'pie': return 'pie';
      case 'radar': return 'radar';
      case 'scatter': return 'scatter';
      case 'histogram': return 'area';
      default: return 'bar';
    }
  };

  const generatePPTXInstance = () => {
    if (!posterData) return null;
    const pres = new pptxgen();
    const isHorizontal = config.format.includes('-H') || config.format === '16:9';
    const theme = PALETTES[config.palette];

    const layoutW = isHorizontal ? 46.81 : 33.11;
    const layoutH = isHorizontal ? 33.11 : 46.81;
    pres.defineLayout({ name: 'POSTER_A0_REAL', width: layoutW, height: layoutH });
    pres.layout = 'POSTER_A0_REAL';

    const slide = pres.addSlide();
    slide.background = { fill: 'FFFFFF' };

    // Barra superior decorativa
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: theme.primary.replace('#', '') } });

    // --- HEADER MEJORADO ---
    // 1. Branding "Scientia Architect"
    slide.addShape(pres.ShapeType.rect, { x: 0.8, y: 0.25, w: 0.5, h: 0.5, fill: { color: 'FFFFFF' } });
    slide.addText("SCIENTIA ARCHITECT", { 
        x: 1.4, y: 0.3, w: 5, h: 0.4, 
        fontSize: 14, bold: true, color: 'FFFFFF', tracking: 10
    });

    // 2. Distintivo del Congreso
    slide.addShape(pres.ShapeType.roundRect, { 
        x: layoutW - 6.5, y: 0.25, w: 5.5, h: 0.5, 
        fill: { color: theme.accent.replace('#', '') },
        line: { color: theme.primary.replace('#', ''), width: 1.5 }
    });
    slide.addText("CONGRESO MÉDICO 2024", { 
        x: layoutW - 6.5, y: 0.3, w: 5.5, h: 0.4, 
        fontSize: 16, bold: true, align: 'center', color: theme.primary.replace('#', '') 
    });

    // 3. Título (Ajustado para evitar solapamiento)
    slide.addText(posterData.title, { 
        x: 1.5, y: 1.3, w: layoutW - 3, h: 3.2, 
        fontSize: 66, bold: true, align: 'center', 
        color: '1e293b', fontFace: 'Arial Black',
        lineSpacing: 80
    });

    // 4. Autores
    slide.addText(posterData.authors.join('; '), { 
        x: 1, y: 4.8, w: layoutW - 2, h: 0.8, 
        fontSize: 36, bold: true, align: 'center', 
        color: theme.secondary.replace('#', '') 
    });

    // 5. Afiliación / Hospital
    slide.addText(posterData.affiliation, { 
        x: 1, y: 5.8, w: layoutW - 2, h: 0.6, 
        fontSize: 26, align: 'center', color: '94a3b8', italic: true 
    });

    // --- FLUJO VERTICAL: INTRO -> METODO -> RESULTADOS -> CONCLU ---
    const margin = 1.5;
    const contentW = layoutW - (margin * 2);
    let currentY = 7.5; // Espacio ampliado para el header
    const gap = 0.8;
    const footerSpace = 1.2;
    const totalContentH = layoutH - currentY - footerSpace;

    const hIntro = totalContentH * 0.20;
    const hMethod = totalContentH * 0.15;
    const hResults = totalContentH * 0.50;
    const hConclusions = totalContentH * 0.15;

    const addSectionCard = (title: string, x: number, y: number, w: number, h: number) => {
        slide.addShape(pres.ShapeType.rect, { 
            x: x, y: y, w: w, h: h, 
            fill: { color: 'FFFFFF' }, 
            line: { color: 'F1F5F9', width: 4 } 
        });
        slide.addShape(pres.ShapeType.rect, { 
            x: x + 0.3, y: y + 0.3, w: 0.25, h: 0.8, 
            fill: { color: theme.primary.replace('#', '') } 
        });
        slide.addText(title, { 
            x: x + 0.7, y: y + 0.3, w: w - 1, h: 0.8, 
            fontSize: 40, bold: true, color: theme.primary.replace('#', ''),
            fontFace: 'Arial Narrow'
        });
        return { contentY: y + 1.4, contentW: w - 1.2, contentX: x + 0.6 };
    };

    // 1. INTRODUCCIÓN Y OBJETIVOS
    const introCard = addSectionCard("INTRODUCCIÓN Y OBJETIVOS", margin, currentY, contentW, hIntro);
    slide.addText([...posterData.introduction].join('\n\n'), { 
        x: introCard.contentX, y: introCard.contentY, w: introCard.contentW, h: hIntro * 0.5, 
        fontSize: 32, color: '334155', align: 'justify', lineSpacing: 36
    });
    slide.addText(`OBJETIVO: ${posterData.objectives.join(' ')}`, { 
        x: introCard.contentX, y: introCard.contentY + (hIntro * 0.55), w: introCard.contentW, h: 2.0, 
        fontSize: 34, bold: true, italic: true, color: '1e293b', 
        fill: { color: theme.accent.replace('#', '') },
        margin: 15
    });
    currentY += hIntro + gap;

    // 2. METODOLOGÍA
    const methodCard = addSectionCard("METODOLOGÍA", margin, currentY, contentW, hMethod);
    slide.addText(posterData.methods.map((m, i) => `${i+1}. ${m}`).join('\n\n'), { 
        x: methodCard.contentX, y: methodCard.contentY, w: methodCard.contentW, h: hMethod * 0.7, 
        fontSize: 30, color: '475569', lineSpacing: 34
    });
    currentY += hMethod + gap;

    // 3. RESULTADOS Y ANÁLISIS
    const resCard = addSectionCard("RESULTADOS Y ANÁLISIS DE DATOS", margin, currentY, contentW, hResults);
    
    // Tabla Demográfica
    const tableData = [
        [{ text: 'VARIABLE CLÍNICA', options: { bold: true, fill: 'f1f5f9', fontSize: 28, color: '64748b' } }, { text: 'VALOR', options: { bold: true, fill: 'f1f5f9', fontSize: 28, align: 'right', color: '64748b' } }],
        ...posterData.demographics.map((d, i) => [
            { text: d.label, options: { fontSize: 26, fill: i % 2 === 0 ? 'FFFFFF' : 'FDFDFD' } }, 
            { text: d.value, options: { fontSize: 26, bold: true, align: 'right', color: theme.primary.replace('#', ''), fill: i % 2 === 0 ? 'FFFFFF' : 'FDFDFD' } }
        ])
    ];
    slide.addTable(tableData as any, { 
        x: resCard.contentX, y: resCard.contentY, w: resCard.contentW * 0.45, 
        border: { type: 'solid', color: 'F1F5F9', pt: 2 } 
    });

    const chartY = resCard.contentY;
    const chartW = (resCard.contentW * 0.5) / 2;
    const chartX = resCard.contentX + (resCard.contentW * 0.48);
    
    slide.addChart(getPpptxChartType(config.microChartType), [{ name: 'Data', labels: posterData.speciesDistribution.map(d => d.name), values: posterData.speciesDistribution.map(d => d.value) }], { 
        x: chartX, y: chartY, w: chartW, h: 7.0, 
        showLegend: true, legendPos: 'b', legendFontSize: 12, 
        chartColors: CHART_COLORS, title: 'DISTRIBUCIÓN ESPECIES', titleFontSize: 16 
    });
    
    slide.addChart(getPpptxChartType(config.outcomeChartType), [
        { name: 'Tto (+)', labels: posterData.outcomes.subgroupAnalysis.map(s => s.group), values: posterData.outcomes.subgroupAnalysis.map(s => s.valueA) },
        { name: 'Tto (-)', labels: posterData.outcomes.subgroupAnalysis.map(s => s.group), values: posterData.outcomes.subgroupAnalysis.map(s => s.valueB) }
    ], { 
        x: chartX + chartW + 0.4, y: chartY, w: chartW, h: 7.0, 
        showLegend: true, legendPos: 'b', legendFontSize: 12, 
        chartColors: [theme.primary.replace('#', ''), theme.secondary.replace('#', '')],
        title: 'ANÁLISIS RESULTADOS', titleFontSize: 16 
    });

    const statsY = chartY + 7.5;
    slide.addText("EVIDENCIA ESTADÍSTICA", { x: resCard.contentX, y: statsY, w: resCard.contentW, h: 0.6, fontSize: 26, bold: true, color: '94a3b8' });
    let statsUsedH = 1.0;
    if (posterData.outcomes.statisticalStatements && posterData.outcomes.statisticalStatements.length > 0) {
      posterData.outcomes.statisticalStatements.forEach((stmt, idx) => {
        slide.addText(`• ${stmt}`, { 
            x: resCard.contentX, y: statsY + 0.8 + (idx * 1.1), w: resCard.contentW, h: 1.0, 
            fontSize: 28, italic: true, color: theme.primary.replace('#', ''), align: 'justify'
        });
        statsUsedH += 1.1;
      });
    } else {
        slide.addText(`• p-value = ${posterData.outcomes.pValue}`, { x: resCard.contentX, y: statsY + 0.8, w: resCard.contentW, h: 1.0, fontSize: 28, italic: true, color: theme.primary.replace('#', '') });
        statsUsedH += 1.1;
    }

    const findingY = statsY + statsUsedH + 0.5;
    slide.addText(`"${posterData.outcomes.finding}"`, { 
        x: resCard.contentX, y: findingY, w: resCard.contentW, h: 2.2, 
        fontSize: 38, italic: true, bold: true, color: '1e293b', 
        fill: { color: 'F8FAFC' }, border: { type: 'solid', color: 'E2E8F0', pt: 2 },
        align: 'center'
    });

    currentY += hResults + gap;

    // 4. CONCLUSIONES
    const concCard = addSectionCard("CONCLUSIONES", margin, currentY, contentW, hConclusions);
    slide.addText(posterData.conclusions.join('\n\n'), { 
        x: concCard.contentX, y: concCard.contentY, w: concCard.contentW, h: hConclusions * 0.6, 
        fontSize: 34, color: '1e293b', bold: true, lineSpacing: 40
    });

    // FOOTER
    slide.addText(`© 2024 SEFH Poster Architect | Diseño Vertical Unificado | Formato A0`, { 
        x: 0, y: layoutH - 1.0, w: layoutW, h: 0.8, 
        fontSize: 18, align: 'center', color: '94a3b8', bold: true 
    });

    return pres;
  };

  const exportToPPTX = () => {
    const pres = generatePPTXInstance();
    if (pres && posterData) {
        pres.writeFile({ fileName: `Poster_A0_Cientifico_${posterData.title.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.pptx` });
    }
  };

  const openInGoogleSlides = () => {
    const pres = generatePPTXInstance();
    if (pres && posterData) {
        pres.writeFile({ fileName: `Poster_Google_Slides.pptx` });
        window.open('https://slides.new', '_blank');
        console.log("Para usar en Google Slides: Archivo -> Abrir -> Subir -> Selecciona el archivo descargado");
    }
  };

  const updateConfig = (key: keyof PosterConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderChartSelector = (key: 'microChartType' | 'outcomeChartType', label: string) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400">{label}</label>
      <div className="grid grid-cols-6 gap-1">
        {(['radar', 'bar', 'bar-h', 'pie', 'scatter', 'histogram'] as ChartType[]).map(t => (
          <button
            key={t}
            title={t.toUpperCase()}
            onClick={() => updateConfig(key, t)}
            className={`py-2 text-[8px] font-black uppercase rounded-lg border transition-all ${config[key] === t ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'}`}
          >
            {t === 'bar-h' ? 'H-BAR' : t.substring(0, 4)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-700">
      <div className="w-full md:w-[380px] bg-white border-r border-slate-200 p-6 no-print flex flex-col gap-6 overflow-y-auto max-h-screen shadow-lg z-10">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-xs text-white">MA</span>
            Poster Architect
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">AI Scientific Designer</p>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Abstract Clínico</label>
          <textarea
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-xs leading-relaxed text-slate-900 placeholder:opacity-50"
            placeholder="Pegue aquí su abstract..."
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleGenerate}
              disabled={status === AppStatus.LOADING}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all text-xs uppercase shadow-md shadow-blue-100 disabled:opacity-50"
            >
              {status === AppStatus.LOADING ? 'PROCESANDO...' : 'GENERAR PÓSTER'}
            </button>
            <button onClick={loadExample} className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-black text-xs uppercase">EJEMPLO</button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Paleta</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(PALETTES_PREVIEW) as ColorPalette[]).map(p => (
                <button
                  key={p}
                  onClick={() => updateConfig('palette', p)}
                  className={`h-8 rounded-lg border-2 transition-all ${config.palette === p ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: PALETTES_PREVIEW[p] }}
                  title={p.replace('-', ' ').toUpperCase()}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Orientación</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-2 text-[10px] font-bold"
                value={config.format}
                onChange={(e) => updateConfig('format', e.target.value)}
              >
                <option value="A0-V">A0 Vertical</option>
                <option value="A0-H">A0 Horizontal</option>
                <option value="9:16">Vertical 9:16</option>
                <option value="16:9">Panorámico 16:9</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Estilo</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-2 text-[10px] font-bold"
                value={config.style}
                onChange={(e) => updateConfig('style', e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="dashboard">Dashboard</option>
                <option value="journal">Journal</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>

          {renderChartSelector('microChartType', 'Gráfico de Datos')}
          {renderChartSelector('outcomeChartType', 'Gráfico de Resultados')}
        </div>

        {status === AppStatus.READY && (
          <div className="space-y-2 mt-auto pt-4">
            <button 
                onClick={exportToPDF}
                disabled={isExportingPDF}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl transition-all shadow-xl hover:bg-black flex items-center justify-center gap-2 text-xs uppercase disabled:opacity-75"
            >
                {isExportingPDF ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'DESCARGAR PDF'}
            </button>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={exportToPPTX}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-[10px] uppercase"
                >
                    PPTX
                </button>
                <button 
                    onClick={openInGoogleSlides}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-[10px] uppercase"
                >
                    GOOGLE SLIDES
                </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-8 md:p-12 bg-slate-200 overflow-y-auto h-screen flex justify-center items-start scrollbar-hide">
        {status === AppStatus.IDLE && (
          <div className="text-center my-auto opacity-30">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-white">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Esperando Datos</p>
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="my-auto text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 animate-pulse">Analizando Evidencias...</p>
          </div>
        )}

        {status === AppStatus.READY && posterData && (
          <div className="w-fit h-fit pb-20 origin-top">
            <PosterLayout data={posterData} config={config} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
