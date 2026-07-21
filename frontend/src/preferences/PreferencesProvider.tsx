import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';


export type Language = 'es' | 'en';
export type ThemePreference = 'light' | 'dark' | 'system';
export type TextSize = 'small' | 'medium' | 'large';
export type FontStyle = 'sans' | 'technical';

interface Preferences {
  language: Language;
  theme: ThemePreference;
  textSize: TextSize;
  fontStyle: FontStyle;
}

interface PreferencesContextValue extends Preferences {
  resolvedTheme: 'light' | 'dark';
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemePreference) => void;
  setTextSize: (textSize: TextSize) => void;
  setFontStyle: (fontStyle: FontStyle) => void;
  reset: () => void;
  t: (key: string) => string;
}

const STORAGE_KEY = 'lain5g.preferences.v1';

const messages: Record<string, Record<Language, string>> = {
  'nav.operation': { es: 'Operación', en: 'Operation' },
  'nav.observability': { es: 'Observabilidad', en: 'Observability' },
  'nav.administration': { es: 'Administración', en: 'Administration' },
  'nav.overview': { es: 'Resumen', en: 'Overview' },
  'nav.scenarios': { es: 'Escenarios', en: 'Scenarios' },
  'nav.realIms': { es: 'IMS real', en: 'Real IMS' },
  'nav.topology': { es: 'Topología', en: 'Topology' },
  'nav.subscribers': { es: 'Suscriptores', en: 'Subscribers' },
  'nav.validation': { es: 'Validación', en: 'Validation' },
  'nav.metrics': { es: 'Métricas', en: 'Metrics' },
  'nav.logs': { es: 'Registros', en: 'Logs' },
  'nav.runs': { es: 'Ejecuciones', en: 'Runs' },
  'nav.preparation': { es: 'Preparación', en: 'Preparation' },
  'nav.deployments': { es: 'Despliegues', en: 'Deployments' },
  'nav.settings': { es: 'Preferencias', en: 'Settings' },
  'nav.rfSafety': { es: 'Seguridad RF', en: 'RF Safety' },
  'shell.systemLink': { es: 'Conexión del sistema', en: 'System link' },
  'shell.backendOnline': { es: 'Backend en línea', en: 'Backend online' },
  'shell.backendUnavailable': { es: 'Backend no disponible', en: 'Backend unavailable' },
  'shell.dryRun': { es: 'Modo simulación', en: 'Dry-run mode' },
  'shell.realMode': { es: 'Modo real', en: 'Real mode' },
  'shell.dryRunShort': { es: 'SIMULACIÓN', en: 'DRY-RUN' },
  'shell.realModeShort': { es: 'MODO REAL', en: 'REAL MODE' },
  'shell.emergencyStop': { es: 'Parada de emergencia', en: 'Emergency stop' },
  'shell.controlPlane': { es: 'PLANO DE CONTROL', en: 'CONTROL PLANE' },
  'shell.activeScenario': { es: 'Escenario activo', en: 'Active scenario' },
  'shell.quickSearch': { es: 'Búsqueda rápida', en: 'Quick search' },
  'shell.notifications': { es: 'Notificaciones', en: 'Notifications' },
  'shell.expandNavigation': { es: 'Expandir navegación', en: 'Expand navigation' },
  'shell.collapseNavigation': { es: 'Colapsar navegación', en: 'Collapse navigation' },
  'shell.noEvents': { es: 'No hay eventos nuevos. Revisa ejecuciones y registros.', en: 'No unread backend events. Follow active operations in runs and logs.' },
  'settings.eyebrow': { es: 'Administración local', en: 'Local administration' },
  'settings.title': { es: 'Preferencias', en: 'Settings' },
  'settings.subtitle': { es: 'Personaliza el idioma, la apariencia y el tamaño del texto. Los cambios se guardan solo en este navegador.', en: 'Customize language, appearance, and text size. Changes are stored only in this browser.' },
  'settings.language': { es: 'Idioma', en: 'Language' },
  'settings.languageHelp': { es: 'Cambia los textos propios de la interfaz.', en: 'Changes text owned by the user interface.' },
  'settings.appearance': { es: 'Apariencia', en: 'Appearance' },
  'settings.appearanceHelp': { es: 'Usa tema claro, oscuro o sigue la configuración del sistema.', en: 'Use light, dark, or follow the operating system.' },
  'settings.textSize': { es: 'Tamaño del texto', en: 'Text size' },
  'settings.textSizeHelp': { es: 'Ajusta la lectura sin cambiar los datos del laboratorio.', en: 'Adjust readability without changing laboratory data.' },
  'settings.fontStyle': { es: 'Estilo de letra', en: 'Font style' },
  'settings.fontStyleHelp': { es: 'Elige una interfaz moderna o una lectura técnica monoespaciada.', en: 'Choose a modern interface or technical monospaced reading.' },
  'settings.sans': { es: 'Moderna', en: 'Modern' },
  'settings.technical': { es: 'Técnica', en: 'Technical' },
  'settings.spanish': { es: 'Español', en: 'Spanish' },
  'settings.english': { es: 'Inglés', en: 'English' },
  'settings.light': { es: 'Claro', en: 'Light' },
  'settings.dark': { es: 'Oscuro', en: 'Dark' },
  'settings.system': { es: 'Sistema', en: 'System' },
  'settings.small': { es: 'Pequeño', en: 'Small' },
  'settings.medium': { es: 'Normal', en: 'Default' },
  'settings.large': { es: 'Grande', en: 'Large' },
  'settings.reset': { es: 'Restablecer preferencias', en: 'Reset preferences' },
  'settings.preview': { es: 'Vista previa', en: 'Preview' },
  'settings.previewTitle': { es: 'Consola legible y consistente', en: 'Readable, consistent console' },
  'settings.previewBody': { es: 'Los controles operativos, advertencias y valores técnicos mantienen su significado.', en: 'Operational controls, warnings, and technical values keep their meaning.' },
  'settings.backend': { es: 'Conectividad del backend', en: 'Backend connectivity' },
  'settings.service': { es: 'Servicio', en: 'Service' },
  'settings.status': { es: 'Estado', en: 'Status' },
  'settings.mode': { es: 'Modo', en: 'Mode' },
  'settings.updates': { es: 'Actualización', en: 'Updates' },
  'settings.polling': { es: 'Cada 10 segundos', en: 'Every 10 seconds' },
  'settings.streaming': { es: 'Actualización de datos', en: 'Data updates' },
  'settings.streamingBody': { es: 'Los registros y servicios usan consultas controladas; WebSocket y SSE no están habilitados.', en: 'Logs and service state use controlled polling; WebSocket and SSE are not enabled.' },
  'preparation.eyebrow': { es: 'Preparación del host', en: 'Host preparation' },
  'preparation.title': { es: 'Equipo y componentes', en: 'System and components' },
  'preparation.subtitle': { es: 'Comprueba el laboratorio y descarga imágenes compatibles desde Docker Hub antes de iniciar un perfil.', en: 'Check the laboratory and download compatible images from Docker Hub before starting a profile.' },
  'preparation.refresh': { es: 'Actualizar', en: 'Refresh' },
  'preparation.overall': { es: 'Estado general', en: 'Overall status' },
  'preparation.noAutomatic': { es: 'Sin acciones automáticas', en: 'No automatic actions' },
  'preparation.diagnostics': { es: 'Diagnóstico', en: 'Diagnostics' },
  'preparation.checksPassed': { es: 'Comprobaciones superadas', en: 'Checks passed' },
  'preparation.profilesReady': { es: 'Perfiles listos', en: 'Profiles ready' },
  'preparation.localCatalog': { es: 'Catálogo local', en: 'Local catalog' },
  'preparation.images': { es: 'Imágenes', en: 'Images' },
  'preparation.installedRefs': { es: 'Referencias instaladas', en: 'Installed references' },
  'preparation.systemCapacity': { es: 'Capacidad del sistema', en: 'System capabilities' },
  'preparation.componentsByProfile': { es: 'Componentes por perfil', en: 'Components by profile' },
  'preparation.rfProtected': { es: 'RF protegida', en: 'Protected RF' },
  'preparation.simulation': { es: 'Simulación', en: 'Simulation' },
  'preparation.downloadHelp': { es: 'Descarga únicamente las imágenes faltantes y crea las etiquetas locales. No compila, no inicia servicios y no habilita RF.', en: 'Downloads only missing images and creates local tags. It does not build, start services, or enable RF.' },
  'preparation.downloadMissing': { es: 'Descargar faltantes', en: 'Download missing' },
  'preparation.component': { es: 'Componente', en: 'Component' },
  'preparation.publishedSource': { es: 'Origen publicado', en: 'Published source' },
  'preparation.state': { es: 'Estado', en: 'Status' },
  'dashboard.eyebrow': { es: 'Resumen operativo', en: 'Operations overview' },
  'dashboard.subtitle': { es: 'Centro de control 5G SA respaldado por FastAPI, Docker Compose y validadores.', en: '5G SA laboratory command center backed by FastAPI, Docker Compose and validation scripts.' },
  'dashboard.sync': { es: 'Sincronizar', en: 'Sync status' },
  'dashboard.start': { es: 'Iniciar', en: 'Start' },
  'dashboard.validate': { es: 'Validar', en: 'Validate' },
  'dashboard.stop': { es: 'Detener', en: 'Stop' },
  'dashboard.activeServices': { es: 'Servicios activos', en: 'Active services' },
  'dashboard.reportedByApi': { es: 'reportados por la API', en: 'reported by API' },
  'dashboard.registeredUes': { es: 'UE registrados', en: 'Registered UEs' },
  'dashboard.validationEvidence': { es: 'Evidencia de validación, no conteo de contenedores', en: 'Validation evidence, not container count' },
  'dashboard.dataSessions': { es: 'Sesiones de datos', en: 'Data sessions' },
  'dashboard.pduEvidence': { es: 'Evidencia de sesión PDU', en: 'PDU session validation evidence' },
  'dashboard.passRate': { es: 'Tasa de validación', en: 'Validation pass rate' },
  'dashboard.noValidation': { es: 'Sin validación todavía', en: 'No validation report yet' },
  'dashboard.requiredComponents': { es: 'Componentes requeridos', en: 'Required components' },
  'dashboard.openPreparation': { es: 'Abrir preparación', en: 'Open preparation' },
};

function defaultPreferences(): Preferences {
  return { language: 'en', theme: 'light', textSize: 'medium', fontStyle: 'sans' };
}

function loadPreferences(): Preferences {
  const defaults = defaultPreferences();
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<Preferences>;
    return {
      language: stored.language === 'es' || stored.language === 'en' ? stored.language : defaults.language,
      theme: stored.theme === 'light' || stored.theme === 'dark' || stored.theme === 'system' ? stored.theme : defaults.theme,
      textSize: stored.textSize === 'small' || stored.textSize === 'medium' || stored.textSize === 'large' ? stored.textSize : defaults.textSize,
      fontStyle: stored.fontStyle === 'sans' || stored.fontStyle === 'technical' ? stored.fontStyle : defaults.fontStyle,
    };
  } catch {
    return defaults;
  }
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [systemDark, setSystemDark] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true);
  const resolvedTheme = preferences.theme === 'system' ? (systemDark ? 'dark' : 'light') : preferences.theme;

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = preferences.language;
    root.dataset.theme = resolvedTheme;
    root.dataset.themePreference = preferences.theme;
    root.dataset.textSize = preferences.textSize;
    root.dataset.fontStyle = preferences.fontStyle;
    root.style.colorScheme = resolvedTheme;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); } catch { /* Browser storage may be disabled. */ }
  }, [preferences, resolvedTheme]);

  const update = (next: Partial<Preferences>) => setPreferences((current) => ({ ...current, ...next }));
  const value: PreferencesContextValue = {
    ...preferences,
    resolvedTheme,
    setLanguage: (language) => update({ language }),
    setTheme: (theme) => update({ theme }),
    setTextSize: (textSize) => update({ textSize }),
    setFontStyle: (fontStyle) => update({ fontStyle }),
    reset: () => setPreferences(defaultPreferences()),
    t: (key) => messages[key]?.[preferences.language] || key,
  };
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
