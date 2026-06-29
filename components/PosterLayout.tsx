
import React from 'react';
import { PosterData, PosterConfig, ChartType } from '../types';
import { 
  ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell,
  BarChart, Bar, PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';

interface PosterLayoutProps {
  data: PosterData;
  config: PosterConfig;
}

const PALETTES = {
  'medical-blue': { primary: '#003060', secondary: '#004d99', accent: '#e0f2fe', text: '#001e3c' },
  'clinical-green': { primary: '#004d40', secondary: '#00695c', accent: '#e0f2f1', text: '#00251a' },
  'modern-purple': { primary: '#4a148c', secondary: '#7b1fa2', accent: '#f3e5f5', text: '#210035' },
  'slate-gray': { primary: '#1e293b', secondary: '#475569', accent: '#f1f5f9', text: '#0f172a' },
  'deep-red': { primary: '#7f1d1d', secondary: '#b91c1c', accent: '#fef2f2', text: '#450a0a' },
  'ocean-teal': { primary: '#006064', secondary: '#00838f', accent: '#e0f7fa', text: '#002d2f' },
  'vibrant-orange': { primary: '#e65100', secondary: '#f57c00', accent: '#fff3e0', text: '#3e1600' },
  'sky-blue': { primary: '#0284c7', secondary: '#0369a1', accent: '#f0f9ff', text: '#082f49' },
  'royal-gold': { primary: '#33691e', secondary: '#827717', accent: '#f9fbe7', text: '#1b300f' },
  'carbon-black': { primary: '#212121', secondary: '#424242', accent: '#f5f5f5', text: '#000000' }
};

const FORMATS = {
  'A0-V': { width: '841px', height: '1189px', isHorizontal: false },
  'A0-H': { width: '1189px', height: '841px', isHorizontal: true },
  '9:16': { width: '675px', height: '1200px', isHorizontal: false },
  '16:9': { width: '1200px', height: '675px', isHorizontal: true }
};

const CHART_COLORS = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];

const PosterLayout: React.FC<PosterLayoutProps> = ({ data, config }) => {
  const theme = PALETTES[config.palette];
  const format = FORMATS[config.format];
  
  const scatterData = data.outcomes.subgroupAnalysis.map(item => ({
    x: item.valueA,
    y: item.valueB,
    name: item.group
  }));

  const outcomeBarData = data.outcomes.subgroupAnalysis.map(item => ({
    name: item.group,
    'Tratamiento (+)': item.valueA,
    'Tratamiento (-)': item.valueB
  }));

  const renderGenericChart = (type: ChartType, chartData: any[], section: 'micro' | 'outcome') => {
    const isMicro = section === 'micro';
    const tickStyle = { fontSize: 6, fontWeight: 600 };
    const legendStyle = { fontSize: '6px', fontWeight: 'bold', paddingTop: '4px' };
    const tooltipStyle = { fontSize: '8px', padding: '4px', borderRadius: '4px' };

    switch(type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={!isMicro ? outcomeBarData : chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={tickStyle} interval={0} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              {!isMicro ? (
                <>
                  <Bar dataKey="Tratamiento (+)" fill={theme.primary} />
                  <Bar dataKey="Tratamiento (-)" fill={theme.secondary} />
                  <Legend iconSize={6} wrapperStyle={legendStyle} />
                </>
              ) : (
                <Bar dataKey="value" fill={theme.primary} radius={[2, 2, 0, 0]}>
                   {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'bar-h':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={!isMicro ? outcomeBarData : chartData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={tickStyle} />
              <YAxis type="category" dataKey="name" tick={tickStyle} width={45} interval={0} />
              <Tooltip contentStyle={tooltipStyle} />
              {!isMicro ? (
                <>
                  <Bar dataKey="Tratamiento (+)" fill={theme.primary} />
                  <Bar dataKey="Tratamiento (-)" fill={theme.secondary} />
                  <Legend iconSize={6} wrapperStyle={legendStyle} />
                </>
              ) : (
                <Bar dataKey="value" fill={theme.primary} radius={[0, 2, 2, 0]}>
                   {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={!isMicro ? data.outcomes.subgroupAnalysis.map(d => ({name: d.group, value: d.valueA})) : chartData}
                cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value"
                label={({name, value}) => `${name.substring(0,6)}: ${value}`}
                labelLine={false}
                style={{ fontSize: '6px', fontWeight: 'bold' }}
              >
                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" name="Tto (+)" unit="%" tick={tickStyle} domain={[0, 100]} />
              <YAxis type="number" dataKey="y" name="Tto (-)" unit="%" tick={tickStyle} domain={[0, 100]} />
              <ZAxis type="category" dataKey="name" name="Grupo" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
              <Scatter name="Datos" data={scatterData}>
                {scatterData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={!isMicro ? outcomeBarData : chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={tickStyle} interval={0} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey={!isMicro ? 'Tratamiento (+)' : 'value'} stroke={theme.primary} fill={theme.primary} fillOpacity={0.3} />
              {!isMicro && <Area type="monotone" dataKey="Tratamiento (-)" stroke={theme.secondary} fill={theme.secondary} fillOpacity={0.1} />}
              <Legend iconSize={6} wrapperStyle={legendStyle} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default: // radar
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="55%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey={!isMicro ? 'group' : 'name'} tick={tickStyle} />
              <Radar name={!isMicro ? "Tratamiento (+)" : "Valor"} dataKey={!isMicro ? 'valueA' : 'value'} stroke={theme.primary} fill={theme.primary} fillOpacity={0.6} />
              {!isMicro && (
                <Radar name="Tratamiento (-)" dataKey="valueB" stroke={theme.secondary} fill={theme.secondary} fillOpacity={0.3} />
              )}
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        );
    }
  };

  const styleClasses = config.style === 'dashboard' 
    ? `bg-white border-slate-100 rounded-2xl shadow-sm` 
    : config.style === 'journal' 
    ? `bg-transparent border-slate-300 rounded-none border-x-0 border-t-0 border-b` 
    : config.style === 'creative' 
    ? `bg-gradient-to-br from-white to-slate-50 border-transparent rounded-[2rem] shadow-lg` 
    : `bg-white border-blue-50 rounded-xl`;

  const headerClass = "text-[15px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2";

  return (
    <div 
      className={`bg-white shadow-2xl mx-auto flex flex-col p-10 gap-8 transition-all duration-500 overflow-hidden relative`} 
      style={{ 
        width: format.width, 
        minHeight: format.height,
        borderTop: `20px solid ${theme.primary}`,
        fontFamily: config.style === 'journal' ? 'serif' : 'Inter, sans-serif'
      }} 
      id="poster-capture"
    >
      <header className="text-center pb-8 border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: theme.primary }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.827a2 2 0 00-2.09 0L3.394 6.127a2 2 0 00-1.09 1.77v4.206a2 2 0 001.09 1.77L8.304 17.173a2 2 0 002.09 0l4.91-3.3a2 2 0 001.09-1.77V7.897a2 2 0 00-1.09-1.77l-4.91-3.3z" /></svg>
                </div>
                <div className="font-black text-[12px] tracking-[0.4em] uppercase opacity-40" style={{ color: theme.primary }}>Scientia Architect</div>
            </div>
            <div className="px-4 py-1.5 text-[11px] rounded-full border-2 font-black shadow-sm" style={{ backgroundColor: theme.accent, color: theme.primary, borderColor: theme.primary + '30' }}>CONGRESO MÉDICO 2024</div>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-[1.1] max-w-6xl mx-auto">{data.title}</h1>
        <div className="flex flex-col items-center gap-1">
            <p className="text-[14px] font-bold tracking-tight" style={{ color: theme.secondary }}>{data.authors.join('; ')}</p>
            <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.25em]">{data.affiliation}</p>
        </div>
      </header>

      <main className={`grid gap-10 flex-grow ${format.isHorizontal ? 'grid-cols-12' : 'grid-cols-1'}`}>
        {/* COLUMNA IZQUIERDA: BASES */}
        <div className={format.isHorizontal ? 'col-span-4 flex flex-col gap-8' : 'flex flex-col gap-8'}>
          <section className={`p-6 border ${styleClasses}`}>
            <h2 className={headerClass} style={{ color: theme.primary }}>
              <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></span>
              INTRODUCCIÓN Y OBJETIVOS
            </h2>
            <div className="space-y-4">
              {data.introduction.map((point, i) => (
                <p key={i} className="text-slate-700 text-[13px] leading-relaxed text-justify">{point}</p>
              ))}
              <div className="p-5 border-l-4 rounded-r-xl shadow-md" style={{ borderColor: theme.primary, backgroundColor: theme.accent + '40' }}>
                 <p className="font-black text-[13px] leading-tight text-slate-900 italic uppercase tracking-tight">OBJETIVO: {data.objectives.join(' ')}</p>
              </div>
            </div>
          </section>

          <section className={`p-6 border ${styleClasses}`}>
            <h2 className={headerClass} style={{ color: theme.primary }}>
              <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></span>
              METODOLOGÍA
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {data.methods.map((method, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-black text-white shadow-sm" style={{ backgroundColor: theme.primary }}>{i+1}</div>
                  <p className="text-slate-600 text-[12px] font-semibold leading-snug pt-0.5">{method}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS INTEGRADOS */}
        <div className={format.isHorizontal ? 'col-span-8 flex flex-col gap-8' : 'flex flex-col gap-8'}>
          <section className={`p-8 border ${styleClasses} flex-grow`}>
            <h2 className={headerClass} style={{ color: theme.primary }}>
              <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></span>
              RESULTADOS Y ANÁLISIS DE DATOS
            </h2>
            
            {/* 1. TABLA DE DISTRIBUCIÓN */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Población y Muestra</span>
                <div className="flex-grow h-px bg-slate-100"></div>
              </div>
              <div className="border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden">
                <table className="w-full text-[13px] border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-3 px-6 text-left font-black text-[10px] uppercase tracking-wider text-slate-400">Variable Demográfica / Clínica</th>
                            <th className="py-3 px-6 text-right font-black text-[10px] uppercase tracking-wider text-slate-400">Valor / Frecuencia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {data.demographics.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-6 text-slate-600 font-bold">{item.label}</td>
                            <td className="py-3 px-6 text-right font-black text-slate-900" style={{ color: theme.primary }}>{item.value}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>

            {/* 2. Evidencia Gráfica en Paralelo */}
            <div className="grid grid-cols-2 gap-8 h-[320px] mb-8">
              <div className="bg-white rounded-2xl border-2 border-slate-50 p-6 flex flex-col shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Distribución de Especies</span>
                <div className="flex-grow">
                  {renderGenericChart(config.microChartType, data.speciesDistribution, 'micro')}
                </div>
              </div>
              <div className="bg-white rounded-2xl border-2 border-slate-50 p-6 flex flex-col shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Respuesta al Tratamiento</span>
                <div className="flex-grow">
                  {renderGenericChart(config.outcomeChartType, data.outcomes.subgroupAnalysis, 'outcome')}
                </div>
              </div>
            </div>

            {/* 3. VALIDACIÓN ESTADÍSTICA */}
            <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Validación Estadística</h3>
                <div className="space-y-3">
                  {data.outcomes.statisticalStatements && data.outcomes.statisticalStatements.length > 0 ? (
                    data.outcomes.statisticalStatements.map((statement, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: theme.primary }}></div>
                        <p className="text-[13px] font-medium text-slate-700 leading-relaxed italic border-l-2 pl-4" style={{ borderColor: theme.primary + '30' }}>
                          {statement}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: theme.primary }}></div>
                      <p className="text-[13px] font-black italic" style={{ color: theme.primary }}>p = {data.outcomes.pValue}</p>
                    </div>
                  )}
                </div>
            </div>

            {/* 4. Hallazgo Principal (Conclusiones de Resultados) */}
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Conclusión de Resultados</span>
               <p className="text-[15px] font-bold italic text-slate-800 leading-relaxed">"{data.outcomes.finding}"</p>
            </div>
          </section>

          {/* CONCLUSIONES FINALES */}
          <section className={`p-8 border ${styleClasses}`}>
            <h2 className={headerClass} style={{ color: theme.primary }}>
              <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></span>
              CONCLUSIONES
            </h2>
            <div className="grid grid-cols-1 gap-5">
              {data.conclusions.map((conc, i) => (
                <div key={i} className="flex gap-5 items-start bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 shadow-sm" style={{ backgroundColor: theme.primary }}></div>
                  <p className="text-[14px] font-bold text-slate-800 leading-snug">{conc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="text-center text-[10px] text-slate-400 mt-auto pt-8 border-t border-slate-100 flex justify-between items-center opacity-70">
        <div className="flex items-center gap-6">
          <span className="font-black text-slate-500 uppercase tracking-tighter">© SEFH 2024</span>
          <span className="uppercase tracking-[0.3em] font-black text-[9px] px-3 py-1 bg-slate-100 rounded-md">Scientific Poster Architect v7.0</span>
        </div>
        <div className="font-black uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border-2 border-slate-100">
          A0 {format.isHorizontal ? 'HORIZONTAL' : 'VERTICAL'} | {config.palette.replace('-', ' ')}
        </div>
      </footer>
    </div>
  );
};

export default PosterLayout;
