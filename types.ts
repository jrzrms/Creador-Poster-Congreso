
export interface PosterData {
  title: string;
  authors: string[];
  affiliation: string;
  introduction: string[];
  objectives: string[];
  methods: string[];
  demographics: {
    label: string;
    value: string;
  }[];
  speciesDistribution: {
    name: string;
    value: number;
  }[];
  treatmentData: {
    name: string;
    value: number;
    color?: string;
  }[];
  outcomes: {
    withTreatment: number;
    withoutTreatment: number;
    pValue: string;
    finding: string;
    statisticalStatements: string[];
    subgroupAnalysis: {
      group: string;
      valueA: number;
      valueB: number;
    }[];
  };
  conclusions: string[];
}

export type ColorPalette = 
  | 'medical-blue' | 'clinical-green' | 'modern-purple' | 'slate-gray' | 'deep-red'
  | 'ocean-teal' | 'vibrant-orange' | 'sky-blue' | 'royal-gold' | 'carbon-black';

export type PosterStyle = 'standard' | 'dashboard' | 'journal' | 'creative';
export type PosterFormat = 'A0-V' | 'A0-H' | '9:16' | '16:9';
export type ChartType = 'radar' | 'bar' | 'bar-h' | 'pie' | 'scatter' | 'histogram';

export interface PosterConfig {
  palette: ColorPalette;
  style: PosterStyle;
  format: PosterFormat;
  microChartType: ChartType;
  outcomeChartType: ChartType;
}

export enum AppStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error'
}
