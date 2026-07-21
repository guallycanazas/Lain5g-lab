export interface ScenarioGuidance {
  generation: '4G' | '5G';
  variant: string;
  profileTitle: string;
  purpose: string;
  includes: string[];
  excludes: string[];
  hardware: string;
}

export const scenarioGuidance: Record<string, ScenarioGuidance> = {
  '5g-sa': {
    generation: '5G',
    variant: 'SIMULACIÓN',
    profileTitle: '5G simulado con UERANSIM',
    purpose: 'Para aprender y validar registro 5G SA, sesión PDU y conectividad de datos sin utilizar radio real.',
    includes: ['Open5GS 5GC', 'gNB y UE UERANSIM', 'DNN de Internet y túnel UE'],
    excludes: ['USRP o transmisión RF', 'IMS, SIP y llamada VoNR'],
    hardware: 'Solo CPU, Docker y /dev/net/tun.',
  },
  '4g-lte-sim': {
    generation: '4G',
    variant: 'SIMULACIÓN',
    profileTitle: '4G simulado con srsENB + srsUE',
    purpose: 'Para validar attach LTE, bearer y datos usando una radio virtual ZMQ, sin IMS y sin hardware SDR.',
    includes: ['Open5GS EPC', 'srsENB y srsUE sobre ZMQ', 'APN Internet y túnel UE'],
    excludes: ['USRP o transmisión RF', 'IMS, SIP y llamada VoLTE'],
    hardware: 'Solo CPU, Docker y /dev/net/tun.',
  },
  '4g-lte-x310': {
    generation: '4G',
    variant: 'PREPARACIÓN VOLTE RF',
    profileTitle: '4G preparación VoLTE con radio X310',
    purpose: 'Para preparar LTE sobre RF real con EPC e IMS antes de validar un UE físico y una llamada VoLTE.',
    includes: ['Open5GS EPC e IMS', 'srsRAN eNB con USRP X310', 'Preflight, auto-stop y parada de emergencia'],
    excludes: ['Attach de UE físico aún no demostrado', 'Llamada SIP y RTP extremo a extremo aún no validados'],
    hardware: 'Requiere USRP X310, UE/SIM de laboratorio, aislamiento y autorización RF.',
  },
  '5g-sa-x310': {
    generation: '5G',
    variant: 'PREPARACIÓN VONR RF',
    profileTitle: '5G preparación VoNR con radio X310',
    purpose: 'Para preparar la base 5G SA sobre RF real antes de integrar IMS, registrar un UE físico y validar VoNR.',
    includes: ['Open5GS 5GC', 'srsRAN Project gNB con USRP X310', 'Preflight, auto-stop y parada de emergencia'],
    excludes: ['IMS y cliente SIP todavía no integrados', 'Llamada VoNR y RTP todavía no validados'],
    hardware: 'Requiere USRP X310, UE/SIM 5G SA, aislamiento y autorización RF.',
  },
  '5g-nsa-x310': {
    generation: '5G',
    variant: 'NSA EXPERIMENTAL',
    profileTitle: '5G NSA con ancla LTE y radio X310',
    purpose: 'Para configurar EN-DC con una portadora LTE B7 y una portadora secundaria NR n3 sobre dos cadenas RF.',
    includes: ['Open5GS EPC compartido', 'srsENB EN-DC con LTE + NR', 'TX/RX, doble ruta RF, preflight y auto-stop'],
    excludes: ['No inicia RF al aplicar el perfil', 'Compatibilidad con cada UE comercial no garantizada'],
    hardware: 'Requiere USRP X310 con dos rutas RF conectadas, atenuadas y autorizadas.',
  },
};

export function getScenarioGuidance(id: string) {
  return scenarioGuidance[id];
}
