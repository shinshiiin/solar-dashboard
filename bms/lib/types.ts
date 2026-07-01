export interface Pack {
  name: string;
  connected: boolean;
  valid: boolean;
  totalVoltage?: number;
  current?: number;
  soc?: number;
  remainingAh?: number;
  maxCell?: number;
  minCell?: number;
  deltaCell?: number;
  cycles?: number;
  chargeMos?: boolean;
  dischargeMos?: boolean;
  ageMs?: number;
  cells?: number[];
  temps?: number[];
}

export interface DataResponse {
  packs: Pack[];
}
