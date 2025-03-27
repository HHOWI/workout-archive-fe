export interface BodyLogDTO {
  bodyLogSeq?: number;
  userId?: string;
  bodyWeight?: number | null;
  muscleMass?: number | null;
  bodyFat?: number | null;
  recordDate?: Date;
}

export interface BodyLogDataPoint {
  date: string;
  value: number | null;
  isEstimated: boolean;
}

export interface BodyLogStatsDTO {
  bodyWeight: BodyLogDataPoint[];
  muscleMass: BodyLogDataPoint[];
  bodyFat: BodyLogDataPoint[];
}
